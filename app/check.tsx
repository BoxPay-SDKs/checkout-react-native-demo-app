import axios from 'axios';
import BoxpayCheckout from 'boxpay-checkout-reactnative-sdk';
import { ConfigurationOptions, PaymentResultObject } from 'boxpay-checkout-reactnative-sdk/interface';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const Check = () => {
  const [token, setToken] = useState<string>(""); // Token is initially undefined
  const [shopperToken, setShopperToken] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // Function to fetch the token
  const handleApiCall = async () => {
    try {
      const result = await fetchToken();  // Get the token
      if (result.payload != null) {
        setShopperToken(result.payload.shopper_token)
      }
      setToken(result.token); // Set the token in state
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Set the error message in state if the API call fails
      } else {
        setError('An unknown error occurred'); // Handle case where err is not an instance of Error
      }
    }

  };

  useEffect(() => {
    handleApiCall();  // Call the function to fetch the token when the component mounts
  }, []);

  // Handle payment result from BoxpayCheckout
  const handlePaymentResult = (result: PaymentResultObject) => {
    alert(`Payment ${result.status} :  + ${result.transactionId}`);
    router.navigate('/')
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
        <BoxpayCheckout
        token={token}
        onPaymentResult={handlePaymentResult}
        configurationOptions={{
          [ConfigurationOptions.ShowBoxpaySuccessScreen]: true,
          [ConfigurationOptions.EnableSandboxEnv]: true
        }}
        shopperToken={shopperToken}
      />
      ) : (
        <Text style={{ alignSelf: 'center', justifyContent: 'center', paddingTop: 100 }}>{error ? `Error: ${error}` : 'Loading token...'}</Text>
      )}
    </View>
  );
};

const API_URL = 'https://test-apis.boxpay.tech/v0/merchants/lGfqzNSKKA/sessions';

// Fetch the token from API
const fetchToken = async () => {
  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        Authorization: 'Bearer 3z3G6PT8vDhxQCKRQzmRsujsO5xtsQAYLUR3zcKrPwVrphfAqfyS20bvvCg2X95APJsT5UeeS5YdD41aHbz6mg',
      },
    });
    return response.data;
  } catch (error) {
    console.error('fetch token error', error);
    throw error;
  }
};

const requestBody = {
  context: {
    countryCode: 'IN',
    legalEntity: {
      code: 'razorpay',
    },
    orderId: 'test12',
  },
  paymentType: 'S',
  money: {
    amount: '13000',
    currencyCode: 'INR',
  },
  descriptor: {
    line1: 'Some descriptor',
  },
  shopper: {
    firstName: 'Ishika',
    lastName: 'Bansal',
    phoneNumber: '+918520852085',
    email: 'ishika.bansal@boxpay.tech',
    uniqueReference: 'x123y',
    deliveryAddress: {
      address1: 'House No - 5',
      address2: 'Moti Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      countryCode: 'IN',
      postalCode: '110015',
    },
    panNumber: 'CTGPA0002G',
  },
  order: {
    originalAmount: 10000,
    shippingAmount: 2000,
    voucherCode: "VOUCHER",
    taxAmount: 1000,
    items: [
      {
        id: 'test',
        itemName: 'La Fille Regular Solid Handheld Bag Blue',
        description: 'testProduct',
        quantity: 1,
        imageUrl: 'https://assetscdn1.paytm.com/images/catalog/product/B/BA/BAGLAFILLE-BLUEINTO887307A255D05/1563381583133_0..jpg',
        amountWithoutTax: 3000,
      },
      {
        id: 'test',
        itemName: 'Women High-Rise Straight Fit Side Slit Jeans (30)',
        description: 'testProduct',
        quantity: 1,
        imageUrl: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/19202976/2022/7/28/50409467-e71a-44e1-a782-8e6f3e27f9061658997566628-SASSAFRAS-Women-Jeans-241658997565825-1.jpg',
        amountWithoutTax: 2000,
      },
      {
        id: 'test',
        itemName: 'Women Long Full Length Wool Jacket, long Cozy Coat, plus Size Winter Coat',
        description: 'testProduct',
        quantity: 1,
        imageUrl: 'https://i.etsystatic.com/11387641/r/il/96434a/2584644492/il_570xN.2584644492_ju94.jpg',
        amountWithoutTax: 3000,
      },
      {
        id: 'test',
        itemName: 'Women Boots',
        description: 'testProduct',
        quantity: 1,
        imageUrl: 'https://admin.mochishoes.com/product/31-4858/660/31-4858H97.jpg',
        amountWithoutTax: 2000,
      }
    ],
  },
  statusNotifyUrl: 'https://www.boxpay.tech',
  frontendBackUrl: 'https://www.boxp.tech',
  expiryDurationSec: 900,
  createShopperToken: true
};

export default Check;
