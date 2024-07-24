import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';

import product from './product';
import banner from './banner';
import om_webpay from './om_webpay';
import om_accesstoken from './om_accesstoken';
import om_webpay_rec from './om_webpay_rec';
import om_notification from './om_notification';

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([ product, banner, om_webpay, om_accesstoken, om_webpay_rec, om_notification ])
}) 