// Convert frontend enum values to Prisma enum format
const convertProjectStatus = (status) => {
  if (!status) return 'PENDING';
  const statusMap = {
    'active': 'ACTIVE',
    'completed': 'COMPLETED',
    'pending': 'PENDING'
  };
  return statusMap[status.toLowerCase()] || status.toUpperCase();
};

const convertRole = (role) => {
  if (!role) return 'ADMIN';
  const roleMap = {
    'admin': 'ADMIN',
    'super_admin': 'SUPER_ADMIN'
  };
  return roleMap[role.toLowerCase()] || role.toUpperCase();
};

module.exports = { convertProjectStatus, convertRole };