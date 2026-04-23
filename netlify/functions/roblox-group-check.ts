type HandlerEvent = {
  httpMethod?: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
};

type HandlerResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const json = (statusCode: number, body: unknown): HandlerResponse => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  },
  body: JSON.stringify(body)
});

const getUsernameFromEvent = (event: HandlerEvent) => {
  const method = (event.httpMethod ?? 'GET').toUpperCase();
  if (method === 'POST' && event.body) {
    try {
      const parsed = JSON.parse(event.body) as { username?: unknown };
      if (typeof parsed.username === 'string') return parsed.username;
    } catch {}
  }
  const qs = event.queryStringParameters ?? {};
  const fromQs = qs.username;
  return typeof fromQs === 'string' ? fromQs : '';
};

const daysSince = (isoTime: string) => {
  const joinedAtMs = new Date(isoTime).getTime();
  if (!Number.isFinite(joinedAtMs)) return null;
  const nowMs = Date.now();
  const days = Math.floor((nowMs - joinedAtMs) / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) ? Math.max(0, days) : null;
};

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if ((event.httpMethod ?? 'GET').toUpperCase() === 'OPTIONS') {
    return json(200, { ok: true });
  }

  const username = getUsernameFromEvent(event).trim();
  if (!username) {
    return json(400, { ok: false, error: 'username is required' });
  }

  const apiKey = process.env.X_API_KEY || process.env.VITE_X_API_KEY;
  if (!apiKey) {
    return json(500, { ok: false, error: 'missing server api key' });
  }

  try {
    const usernameRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    const usernameData = (await usernameRes.json()) as any;
    const userId = usernameData?.data?.[0]?.id;

    if (!userId) {
      return json(200, {
        ok: true,
        status: 'invalid',
        userId: null,
        days: null,
        message: 'Username Roblox tidak ditemukan atau user dibanned.'
      });
    }

    const groupId = '704572305';
    const filter = encodeURIComponent(`user=='users/${userId}'`);
    const membershipRes = await fetch(
      `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships?filter=${filter}`,
      { headers: { 'x-api-key': apiKey, accept: 'application/json' } }
    );

    const membershipData = (await membershipRes.json()) as any;
    const memberships = membershipData?.groupMemberships;
    const hasMembership = Array.isArray(memberships) && memberships.length > 0;
    const createTime = hasMembership ? (memberships?.[0]?.createTime as string | undefined) : undefined;

    if (!hasMembership) {
      return json(200, {
        ok: true,
        status: 'invalid',
        userId,
        days: 0,
        message: 'Kamu belum join group.'
      });
    }

    if (!createTime) {
      return json(200, {
        ok: true,
        status: 'invalid',
        userId,
        days: null,
        message: 'Kamu sudah join group, tapi tanggal join tidak terbaca. Coba cek lagi nanti.'
      });
    }

    const days = daysSince(createTime);
    const eligible = typeof days === 'number' && days >= 6;

    return json(200, {
      ok: true,
      status: eligible ? 'valid' : 'invalid',
      userId,
      days,
      message: eligible ? 'Sudah join group ≥ 6 hari.' : `Kamu sudah join group, tapi belum 6 hari (baru ${days ?? 0} hari).`
    });
  } catch {
    return json(500, { ok: false, error: 'failed to check membership' });
  }
};
