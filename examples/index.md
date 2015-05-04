---
layout: page
title: Examples
---

This page contains additional examples of how to apply various parts of the specification.

### Complex Attributes <a href="#complex-attributes" id="complex-attributes" class="headerlink"></a>

The following resource object represents an invoice and contains three [complex
attributes](/format/#document-structure-resource-object-complex-attributes):
`notes`, `total`, and `customer-references`.

```json
{
  "type": "invoices",
  "id": "1234",
  "date": "2015-02-14",
  "due": "2015-03-14",
  "notes": ["Lorem ipsum dolor sit amet", "Consectetuer adipiscing elit"],
  "total": {
    "currency": "EUR",
    "line-items": 3000.00,
    "discounts": 150.00,
    "tax": {
      "tax-type": "VAT",
      "taxable-amount": 2850.00,
      "tax-amount": 570.00
    },
    "amount-payable": 3420.00
  },
  "customer-references": [{
    "ref-type": "purchase-order",
    "text": "AB3210"
  }, {
    "ref-type": "other",
    "text": "Department XYZ"
  }],
  "links": {
    "customer": {
      "related": "http://example.com/invoices/1234/customer"
    },
    "line-items": {
      "related": "http://example.com/invoices/1234/line-items"
    }
  }
}
```

