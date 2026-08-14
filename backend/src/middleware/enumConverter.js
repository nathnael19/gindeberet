// Convert frontend enum values to Prisma enum format
const PROJECT_STATUSES = new Set(['ACTIVE', 'COMPLETED', 'PENDING']);
const ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

const convertProjectStatus = (status) => {
  if (!status) return 'PENDING';
  const statusMap = {
    active: 'ACTIVE',
    completed: 'COMPLETED',
    pending: 'PENDING',
  };
  const normalized = statusMap[String(status).toLowerCase()] || String(status).toUpperCase();
  return PROJECT_STATUSES.has(normalized) ? normalized : 'PENDING';
};

const convertRole = (role) => {
  if (!role) return 'ADMIN';
  const roleMap = {
    admin: 'ADMIN',
    super_admin: 'SUPER_ADMIN',
    'super-admin': 'SUPER_ADMIN',
    superadmin: 'SUPER_ADMIN',
  };
  const normalized = roleMap[String(role).toLowerCase()] || String(role).toUpperCase();
  return ROLES.has(normalized) ? normalized : 'ADMIN';
};

module.exports = { convertProjectStatus, convertRole };