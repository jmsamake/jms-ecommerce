export default {
  name: 'om_notification',
  title: 'OM Webpay Trx Notif',
  type: 'document',
  
  fields: [
    { 
        name: 'status',
        title: 'Status',
        type: 'string',
    }, 
    { 
        name: 'notif_token',
        title: 'Notif Token',
        type: 'string',
    },
    { 
        name: 'txnid',
        title: 'Trx ID',
        type: 'string',
    },
    {
        name: 'lastupdate',
        title: 'Last Update',       
        type: 'datetime'
    }
  ]
}