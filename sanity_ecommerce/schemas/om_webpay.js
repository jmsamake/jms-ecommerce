export default {
  name: 'om_webpay',
  title: 'OM Webpay',
  type: 'document',
  
  fields: [
    { 
      name: 'name',
      title: 'Config Name',
      type: 'string',
  },
	{ 
      name: 'payment_url',
      title: 'Webpay URL',
      type: 'string',
  },
	{ 
      name: 'merchant_key',
      title: 'Merchant Key',
      type: 'string',
  },
	{ 
      name: 'currency',
      title: 'Currency',
      type: 'string',
  },
  { 
      name: 'return_url',
      title: 'Return URL',
      type: 'string',
  },	
  { 
      name: 'cancel_url',
      title: 'Cancel URL',
      type: 'string',
  },
	{ 
      name: 'notif_url',
      title: 'Notif URL',
      type: 'string',
  },
	{ 
      name: 'lang',
      title: 'Language',
      type: 'string',
  },
	{ 
      name: 'reference',
      title: 'Reference',
      type: 'string',
  }
  ]
}