import BoxpayCheckout from 'boxpay-checkout-reactnative-sdk';
import { ConfigurationOptions, PaymentResultObject, UIConfigurationOptions } from 'boxpay-checkout-reactnative-sdk/interface';
import * as Font from 'expo-font';
import { useState } from 'react';
import { Button, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const EnterTokenScreen = () => {
  const [tokenTextInput, setTokenTextInput] = useState("");
  const [shopperTokenTextInput, setShopperTokenTextInput] = useState("");
  const [environment, setEnvironment] = useState("test");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [shopperToken, setShopperToken] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [useNotoSans, setUseNotoSans] = useState(false);       // ← radio button state
  const [ctaBorderRadius, setCtaBorderRadius] = useState(""); 
  const [isFontLoading, setIsFontLoading] = useState(false);
  const [isSICheckboxClicked, setIsSICheckboxClicked] = useState(false)

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'NotoSans-Regular':   require('../assets/fonts/NotoSans-Regular.ttf'),
        'NotoSans-Medium':    require('../assets/fonts/NotoSans-Medium.ttf'),
        'NotoSans-SemiBold':  require('../assets/fonts/NotoSans-SemiBold.ttf'),
        'NotoSans-Bold':      require('../assets/fonts/NotoSans-Bold.ttf'),
        'NotoSans-ExtraBold': require('../assets/fonts/NotoSans-ExtraBold.ttf'),
      });
      setFontsLoaded(true)
    } catch (e) {
      setFontsLoaded(false)
    }
  };


  const environments = [
    { label: "Test", value: "test" },
    { label: "Production", value: "prod" },
  ];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const selectEnvironment = (value: string) => {
    setEnvironment(value);
    setIsDropdownVisible(false);
  };

  const handleProceedPress = () => {
    setShopperToken(shopperTokenTextInput)
    setToken(tokenTextInput)
  };
  const handleNotoSansToggle = async (value: boolean) => {
    if (value && !fontsLoaded) {
      setIsFontLoading(true);        // ← show loader
      await loadFonts();
      setIsFontLoading(false);       // ← hide loader
    }
    setUseNotoSans(value);
  };

  const handlePaymentResult = (result: PaymentResultObject) => {
    alert(`Payment ${result.status} :  + ${result.transactionId}`);
    setToken("")
    // router.navigate('/')
  };


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
        <SafeAreaView style = {{flex :1}}>

        <BoxpayCheckout
        key={token}
        token={token}
        configurationOptions={{
          [ConfigurationOptions.ShowBoxpaySuccessScreen]: true,
          [ConfigurationOptions.EnableSandboxEnv]: environment == "test",
          [ConfigurationOptions.ShowSICheckbox] : isSICheckboxClicked
        }}
        uiConfiguration={{
          ...(useNotoSans && {
            [UIConfigurationOptions.FontFamily]: {
              regular:   'NotoSans-Regular',
              medium:    'NotoSans-Medium',
              semiBold:  'NotoSans-SemiBold',
              bold:      'NotoSans-Bold',
              extraBold: 'NotoSans-ExtraBold'
            },
          }),
          [UIConfigurationOptions.CTABorderRadius]: Number(ctaBorderRadius)
        }}
        onPaymentResult={handlePaymentResult}
        shopperToken={shopperToken}
      />
        </SafeAreaView>
      ) : (
        <View style={styles.container}>
          <TextInput
            mode="outlined"
            label="Enter Token"
            value={tokenTextInput}
            onChangeText={(it) => {
              setTokenTextInput(it);
            }}
            style={styles.textInput}
          />
          <TextInput
            mode="outlined"
            label="Enter Shopper Token"
            value={shopperTokenTextInput}
            onChangeText={(it) => {
              setShopperTokenTextInput(it);
            }}
            style={styles.textInput}
          />

          <TextInput
            mode="outlined"
            label="CTA Border Radius"
            value={ctaBorderRadius}
            onChangeText={(val) => setCtaBorderRadius(val.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            style={styles.textInput}
          />


<View style={styles.radioContainer}>
            <Text style={styles.label}>Load Noto Sans Font:</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleNotoSansToggle(true)}
              >
                <View style={styles.radioOuter}>
                  {useNotoSans && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleNotoSansToggle(false)}
              >
                <View style={styles.radioOuter}>
                  {!useNotoSans && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {useNotoSans && (
  <View style={styles.fontStatusRow}>
    {isFontLoading ? (
      <>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.fontStatus}>  Loading Noto Sans...</Text>
      </>
    ) : fontsLoaded ? (
      <Text style={styles.fontStatus}>✅ Noto Sans loaded</Text>
    ) : null}
  </View>
)}
          </View>

          <Text style={styles.label}>Select Environment:</Text>

          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text>
              {environments.find((env) => env.value === environment)?.label || "Select Environment"}
            </Text>
          </TouchableOpacity>

          <View
              style={styles.checkBoxContainer}
            >
              <TouchableOpacity
                onPress={() => setIsSICheckboxClicked(!isSICheckboxClicked)}
              >
                <View style={[
                  styles.checkboxBox,
                  { borderColor: "#007bff" },
                  isSICheckboxClicked && { backgroundColor: "#007bff" }
                ]}>
                  {isSICheckboxClicked && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[styles.checkBoxText]}
              >
                Show SI checkbox in checkout.
              </Text>
              </View>

          <Pressable style={styles.proceedButton} onPress={handleProceedPress}>
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </Pressable>

          <Modal visible={isDropdownVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={environments}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectEnvironment(item.value)}
                    >
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <Button title="Close" onPress={toggleDropdown} />
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );

};

export default EnterTokenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'semibold',
    marginBottom: 14
  },
  radioContainer: {
    width: '100%',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  textInput: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  fontStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStatus: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  radioLabel: {
    fontSize: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  pressableText: {
    color: 'blue',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  dropdownButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    alignItems: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  proceedButton: {
    width: '100%',
    backgroundColor: '#007bff', // Example color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkBoxContainer : {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center'
},
checkboxBox: {
  width: 20,
  height: 20,
  borderWidth: 2,
  borderRadius: 3,
  justifyContent: 'center',
  alignItems: 'center',
},
checkmark: {
  color: '#fff',
  fontSize: 13,
  fontWeight: 'bold',
  lineHeight: 16,
},
checkBoxText : {
  color: '#2D2B32',
  fontSize: 14,
  marginLeft: 6,
}

});