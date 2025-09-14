function applyTemplate(template, customer) {
  if (!template) return '';
  return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const key = token.trim();
    return (customer && (customer[key] || customer[key] === 0)) ? customer[key] : '';
  });
}

module.exports = { applyTemplate };
