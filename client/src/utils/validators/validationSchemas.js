import * as yup from 'yup';
import valid from 'card-validator';
import moment from 'moment';

const MAX_OFFER_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_OFFER_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default {
  LoginSchema: yup.object().shape({
    email: yup.string().email('check email').required('required'),
    password: yup
      .string()
      .test(
        'test-password',
        'min 6 symbols',
        value => value && value.trim().length >= 6
      )
      .required('required'),
  }),
  RegistrationSchema: yup.object().shape({
    email: yup.string().email('check email').required('Email is required'),
    password: yup
      .string()
      .test(
        'test-password',
        'min 6 symbols',
        value => value && value.trim().length >= 6
      )
      .required('required'),
    confirmPassword: yup
      .string()
      .required('confirm password is required')
      .oneOf([yup.ref('password')], 'confirmation pass must match password'),
    firstName: yup
      .string()
      .test(
        'test-firstName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('First Name is required'),
    lastName: yup
      .string()
      .test(
        'test-lastName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('Last Name is required'),
    displayName: yup
      .string()
      .test(
        'test-displayName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('Display Name is required'),
    role: yup
      .string()
      .matches(/(customer|creator)/)
      .required('Role is required'),
    agreeOfTerms: yup
      .boolean()
      .oneOf([true], 'Must Accept Terms and Conditions')
      .required('Must Accept Terms and Conditions'),
  }),
  ContestSchema: yup.object({
    nameVenture: yup.string().min(3),
    contestType: yup
      .string()
      .matches(/(name|tagline|logo)/)
      .required(),
    title: yup
      .string()
      .test(
        'test-title',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('title of contest required'),
    industry: yup.string().required('industry required'),
    focusOfWork: yup
      .string()
      .test(
        'test-focusOfWork',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('focus of work required'),
    targetCustomer: yup
      .string()
      .test(
        'test-targetCustomer',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('target customers required'),
    styleName: yup.string().min(1),
    typeOfName: yup.string().min(1),
    typeOfTagline: yup.string().min(1),
    brandStyle: yup.string().min(1),
    domainPreference: yup.string().when('contestType', {
      is: 'name',
      then: schema =>
        schema
          .oneOf(
            ['variationsAllowed', 'exactMatch', 'noDomain'],
            'Select a domain preference'
          )
          .required('Domain preference is required'),
      otherwise: schema => schema.notRequired(),
    }),
    file: yup.mixed(),
  }),
  filterSchema: yup.object().shape({
    typeIndex: yup.number().oneOf[(1, 2, 3, 4, 5, 6, 7)],
    contestId: yup.string(),
    awardSort: yup.string().matches(/(desc|asc)/),
    industry: yup.string(),
  }),
  LogoOfferSchema: yup.object({
    offerData: yup
      .mixed()
      .test(
        'file-required',
        'Image is required',
        value => value instanceof File
      )
      .test(
        'file-type',
        'Only JPEG, PNG and WEBP images are allowed',
        value => !value || ALLOWED_OFFER_FILE_TYPES.includes(value.type)
      )
      .test(
        'file-size',
        'Image must be 5 MB or less',
        value => !value || value.size <= MAX_OFFER_FILE_SIZE
      ),
  }),
  TextOfferSchema: yup.object({
    offerData: yup
      .string()
      .trim()
      .max(255, 'Suggestion must be 255 characters or less')
      .required('Suggestion is required'),
  }),
  PaymentSchema: yup.object().shape({
    number: yup
      .string()
      .test(
        'test-cardNumber',
        'Credit Card number is invalid',
        value => valid.number(value).isValid
      )
      .required('required'),
    name: yup
      .string()
      .min(1, 'required atleast one symbol')
      .required('required'),
    cvc: yup
      .string()
      .test('test-cvc', 'cvc is invalid', value => valid.cvv(value).isValid)
      .required('required'),
    expiry: yup
      .string()
      .test(
        'test-expiry',
        'expiry is invalid',
        value => valid.expirationDate(value).isValid
      )
      .required('required'),
  }),
  CashoutSchema: yup.object().shape({
    sum: yup.number().min(5, 'min sum is 5$').required('required'),
    number: yup
      .string()
      .test(
        'test-cardNumber',
        'Credit Card number is invalid',
        value => valid.number(value).isValid
      )
      .required('required'),
    name: yup.string().min(1).required('required'),
    cvc: yup
      .string()
      .test('test-cvc', 'cvc is invalid', value => valid.cvv(value).isValid)
      .required('required'),
    expiry: yup
      .string()
      .test(
        'test-expiry',
        'expiry is invalid',
        value => valid.expirationDate(value).isValid
      )
      .required('required'),
  }),
  UpdateUserSchema: yup.object().shape({
    firstName: yup
      .string()
      .test(
        'test-firstName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('required'),
    lastName: yup
      .string()
      .test(
        'test-lastName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('required'),
    displayName: yup
      .string()
      .test(
        'test-displayName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('required'),
    file: yup.mixed(),
  }),
  MessageSchema: yup.object({
    message: yup
      .string()
      .test(
        'test-message',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('required'),
  }),
  CatalogSchema: yup.object({
    catalogName: yup
      .string()
      .test(
        'test-catalogName',
        'required',
        value => value && value.trim().length >= 1
      )
      .required('required'),
  }),
  EventSchema: yup.object({
    name: yup
      .string()
      .trim()
      .required('Event name is required')
      .max(100, 'Maximum 100 characters'),

    eventAt: yup
      .string()
      .required('Date and time are required')
      .test(
        'future-date',
        'Select a valid date and time in the future',
        value => {
          if (!value) {
            return true;
          }

          const eventDate = moment(value, 'YYYY-MM-DDTHH:mm', true);

          return eventDate.isValid() && eventDate.isAfter(moment());
        }
      ),

    notifyBeforeMinutes: yup
      .number()
      .typeError('Enter the number of minutes')
      .required('Notification time is required')
      .integer('Enter a whole number')
      .min(0, 'Cannot be negative'),
  }),
};
