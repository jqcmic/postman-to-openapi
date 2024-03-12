const { marked } = require('marked');

const supHeaders = ['object', 'name', 'description', 'example', 'type', 'required', 'size', 'uiformfieldname'];
const supHeadersTypeAllowedList = ['array', 'boolean', 'integer', 'number', 'object', 'string'];

function parseMdTable(md) {
  const parsed = marked.lexer(md);
  const table = parsed.find(el => el.type === 'table');
  if (table == null) {
    return {};
  }

  const { header: rawHeader, rows } = table;
  const cells = rows.map(row => row.map(e => e.text));
  const header = rawHeader.map(e => e.text);
  if (!header.includes('object') || !header.includes('name')) {
    return {};
  }

  // Rename Headers (cmic specific)
  const idxHeaderUiFieldName = header.indexOf('CMiC UI fieldname');
  if (idxHeaderUiFieldName >= 0) {
    header[idxHeaderUiFieldName] = 'uiformfieldname'
  }


  const headers = header.map(h => (supHeaders.includes(h) ? h : false));
  const tableObj = cells.reduce((accTable, cell) => {
    const cellObj = cell.reduce((accCell, field, index) => {

      // validate if accCell.type is one of array, boolean, integer, number, object, string (this is from openapi spec)
      accCell.type = supHeadersTypeAllowedList.includes(accCell.type) ? accCell.type : "string";

      // set size as a number
      // accCell.size = Number.isInteger(accCell.size) ? +accCell.size : 0;
      sizeValue = +accCell.size
      accCell.size = isNaN(sizeValue) ? 0 : sizeValue;

      if (headers[index]) {
        // eslint-disable-next-line no-param-reassign
        accCell[headers[index]] = field;
      }
      return accCell;
    }, {});

    // eslint-disable-next-line no-param-reassign
    accTable[cellObj.name] = cellObj;
    return accTable;
  }, {});
  return tableObj;
}

module.exports = { parseMdTable };
