// Goi API cuc bo cua GPM Login (phai bat trong Cai dat -> API, cong mac dinh 19995).
// Chi mo/dong profile co san cua Ha, khong tao/sua profile.

const GPM_API = process.env.GPM_API || 'http://127.0.0.1:19995';

async function gpmGet(urlPath) {
  const response = await fetch(`${GPM_API}${urlPath}`);
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(`GPM ${urlPath} loi: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body.data;
}

async function listGroups() {
  return gpmGet('/api/v3/groups');
}

async function listProfiles(groupId) {
  // Nhom discord co hon 400 profile, lay 1 trang lon de khong sot
  const query = groupId ? `?group_id=${groupId}&per_page=1000` : '?per_page=1000';
  return gpmGet(`/api/v3/profiles${query}`);
}

// Tim profile theo ten (vd "401") trong nhom co ten chua "discord"
async function findDiscordProfiles(names) {
  const groups = await listGroups();
  const group = groups.find((item) => (item.name || '').toLowerCase().includes('discord'));
  const profiles = await listProfiles(group ? group.id : null);
  return names.map((name) => {
    const profile = profiles.find((item) => String(item.name).trim() === String(name));
    if (!profile) {
      throw new Error(`Khong thay profile "${name}" trong nhom ${group ? group.name : '(tat ca)'}`);
    }
    return profile;
  });
}

// Mo profile, tra ve dia chi cong debug "127.0.0.1:xxxxx". winPos/winSize dang "x,y" / "w,h"
async function startProfile(profileId, { winPos = '0,0', winSize = '960,1040', winScale = '1' } = {}) {
  const data = await gpmGet(`/api/v3/profiles/start/${profileId}?win_pos=${winPos}&win_size=${winSize}&win_scale=${winScale}`);
  return data.remote_debugging_address;
}

async function closeProfile(profileId) {
  return gpmGet(`/api/v3/profiles/close/${profileId}`);
}

module.exports = { listGroups, listProfiles, findDiscordProfiles, startProfile, closeProfile };
