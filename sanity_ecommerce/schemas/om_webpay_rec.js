export default {
  name: 'om_webpay_rec',
  title: 'OM Webpay Sales Record',
  type: 'document',
  
  fields: [
  { 
      name: 'status',
      title: 'Status',
      type: 'string',
  },
  { 
      name: 'message',
      title: 'Message',
      type: 'string',
  },
  { 
      name: 'pay_token',
      title: 'Pay Token',
      type: 'string',
  },
  { 
      name: 'payment_url',
      title: 'Payment URL',
      type: 'string',
  },	
  { 
      name: 'notif_token',
      title: 'Notif Token',
      type: 'string',
  },
  { 
      name: 'order_id',
      title: 'Order ID',
      type: 'string',
  },
  {
    name: 'rec_time',
    title: 'Rec Time',       
    type: 'datetime'
  }
  ]
}