export const quoteQuery = (jmespathQuery: string): string => {
  const parts = jmespathQuery.split('.');
  return parts.reduce((result: string, elem: string): string => {
    let elemq = `"${elem}"`;
    const ap = elem.indexOf('[');
    if (ap !== -1) {
      elemq = `"${elem.substring(0, ap)}"${elem.substring(ap)}`;
    }
    if (result.trim().length === 0) {
      return elemq;
    }
    return `${result}.${elemq}`;
  }, '');
};
