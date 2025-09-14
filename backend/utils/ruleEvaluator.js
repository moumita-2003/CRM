const { Op } = require('sequelize');

function fieldToColumn(field) {
  switch (field) {
    case 'total_spend': return 'totalSpend';
    case 'visits': return 'visits';
    case 'last_visit': return 'lastVisit';
    default: return field;
  }
}

function valueForOperator(field, operator, value) {
  if (field === 'last_visit') {
    return new Date(value);
  }
  if (typeof value === 'string' && value.match(/^\d+$/)) return Number(value);
  return value;
}

// Convert AST to simple Sequelize where
function astToWhere(ast) {
  if (!ast) return {};
  if (ast.field) {
    const col = fieldToColumn(ast.field);
    const val = valueForOperator(ast.field, ast.operator, ast.value);
    switch (ast.operator) {
      case '>': return { [col]: { [Op.gt]: val } };
      case '<': return { [col]: { [Op.lt]: val } };
      case '>=': return { [col]: { [Op.gte]: val } };
      case '<=': return { [col]: { [Op.lte]: val } };
      case '=': return { [col]: val };
      default: return {};
    }
  }
  if (ast.op && ast.children) {
    const children = ast.children.map(astToWhere).filter(Boolean);
    if (ast.op === 'AND') return { [Op.and]: children };
    if (ast.op === 'OR') return { [Op.or]: children };
  }
  return {};
}

module.exports = { astToWhere };
