import BoxpayCheckout from 'boxpay-checkout-reactnative-sdk';
import { ConfigurationOptions, PaymentResultObject, UIConfigurationOptions } from 'boxpay-checkout-reactnative-sdk/interface';
import * as Font from 'expo-font';
import { useState } from 'react';
import { Button, FlatList, InputAccessoryView, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(true);
  const [showFailureScreen, setShowFailureScreen] = useState(true);

   // ─── Color state ────────────────────────────────────────────────────────────
   const [focusedBorderColor, setFocusedBorderColor]     = useState<string | null>(null);
   const [borderColor, setBorderColor] = useState<string | null>(null);
   const [isFocusedColorDropdownVisible, setIsFocusedColorDropdownVisible]     = useState(false);
   const [isUnfocusedColorDropdownVisible, setIsUnfocusedColorDropdownVisible] = useState(false);
 
   // ─── Helpers ─────────────────────────────────────────────────────────────────
   const getColorLabel = (value: string | null) =>
     COLOR_OPTIONS.find(c => c.value === value)?.label ?? 'None';

   const inputAccessoryViewID = "checkoutDetailsNumberID";

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

  const COLOR_OPTIONS = [
    { label: 'None',        value: null,      hex: 'transparent' },
    { label: 'Red',         value: '#E53935', hex: '#E53935' },
    { label: 'Black',       value: '#000000', hex: '#000000' },
    { label: 'Blue',        value: '#1E88E5', hex: '#1E88E5' },
    { label: 'Pink',        value: '#E91E8C', hex: '#E91E8C' },
    { label: 'Purple',      value: '#8E24AA', hex: '#8E24AA' },
    { label: 'Light Blue',  value: '#29B6F6', hex: '#29B6F6' },
    { label: 'Green',       value: '#43A047', hex: '#43A047' },
    { label: 'Orange',      value: '#FB8C00', hex: '#FB8C00' },
    { label: 'Teal',        value: '#00897B', hex: '#00897B' },
    { label: 'Indigo',      value: '#3949AB', hex: '#3949AB' },
    { label: 'Yellow',      value: '#FDD835', hex: '#FDD835' },
  ];


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

  const textInputFields =
  focusedBorderColor || borderColor
      ? {
          ...(focusedBorderColor   && { focusedBorderColor }),
          ...(borderColor && { borderColor }),
        }
      : null;

  // ─── Reusable color-picker row ───────────────────────────────────────────────
  const ColorPickerRow = ({
    label,
    selected,
    onSelect,
    isVisible,
    setVisible,
  }: {
    label: string;
    selected: string | null;
    onSelect: (v: string | null) => void;
    isVisible: boolean;
    setVisible: (v: boolean) => void;
  }) => (
    <View style={styles.colorPickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.colorDropdownButton}
        onPress={() => setVisible(true)}
      >
        {/* Swatch */}
        <View
          style={[
            styles.colorSwatch,
            {
              backgroundColor: selected ?? 'transparent',
              borderWidth: selected ? 0 : 1,
              borderColor: '#ccc',
            },
          ]}
        />
        <Text style={styles.colorDropdownText}>{getColorLabel(selected)}</Text>
        <Text style={styles.dropdownChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="fade" transparent>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.colorModalContent}>
            <Text style={styles.colorModalTitle}>{label}</Text>
            <FlatList
              data={COLOR_OPTIONS}
              keyExtractor={item => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.colorItem,
                    selected === item.value && styles.colorItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: item.hex,
                        borderWidth: item.value === null ? 1 : 0,
                        borderColor: '#ccc',
                      },
                    ]}
                  />
                  <Text style={styles.colorItemLabel}>{item.label}</Text>
                  {selected === item.value && (
                    <Text style={styles.colorItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
        <SafeAreaView style = {{flex :1}}>

        <BoxpayCheckout
        key={token}
        token={token}
        configurationOptions={{
          [ConfigurationOptions.ShowBoxpaySuccessScreen]: showSuccessScreen,
          [ConfigurationOptions.EnableSandboxEnv]: environment == "test",
          [ConfigurationOptions.ShowSICheckbox]: isSICheckboxClicked,
          [ConfigurationOptions.ShowBoxpayFailedScreen]: showFailureScreen
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
          [UIConfigurationOptions.CTABorderRadius]: Number(ctaBorderRadius),
          ...(textInputFields && {
            [UIConfigurationOptions.TextInputFields]: textInputFields,
          })
        }}
        onPaymentResult={handlePaymentResult}
        shopperToken={shopperToken}
      />
        </SafeAreaView>
      ) : (
        <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <TextInput
            mode="outlined"
            label="Enter Token"
            value={tokenTextInput}
            onChangeText={(it) => {
              setTokenTextInput(it);
            }}
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />
          <TextInput
            mode="outlined"
            label="Enter Shopper Token"
            value={shopperTokenTextInput}
            onChangeText={(it) => {
              setShopperTokenTextInput(it);
            }}
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />

          <TextInput
            mode="outlined"
            label="CTA Border Radius"
            value={ctaBorderRadius}
            onChangeText={(val) => setCtaBorderRadius(val.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />

          {/* Success Screen Checkbox */}
<View style={styles.checkBoxContainer}>
  <TouchableOpacity
    onPress={() => setShowSuccessScreen(!showSuccessScreen)}
  >
    <View style={[
      styles.checkboxBox,
      { borderColor: "#007bff" },
      showSuccessScreen && { backgroundColor: "#007bff" }
    ]}>
      {showSuccessScreen && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </View>
  </TouchableOpacity>
  <Text style={styles.checkBoxText}>
    Show Success Screen
  </Text>
</View>

{/* Failure Screen Checkbox */}
<View style={styles.checkBoxContainer}>
  <TouchableOpacity
    onPress={() => setShowFailureScreen(!showFailureScreen)}
  >
    <View style={[
      styles.checkboxBox,
      { borderColor: "#007bff" },
      showFailureScreen && { backgroundColor: "#007bff" }
    ]}>
      {showFailureScreen && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </View>
  </TouchableOpacity>
  <Text style={styles.checkBoxText}>
    Show Failure Screen
  </Text>
</View>


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
      <View>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.fontStatus}>  Loading Noto Sans...</Text>
      </View>
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

          {/* ── Color pickers ── */}
          <ColorPickerRow
            label="Text Input Focused Color:"
            selected={focusedBorderColor}
            onSelect={setFocusedBorderColor}
            isVisible={isFocusedColorDropdownVisible}
            setVisible={setIsFocusedColorDropdownVisible}
          />
          <ColorPickerRow
            label="Text Input Unfocused Color:"
            selected={borderColor}
            onSelect={setBorderColor}
            isVisible={isUnfocusedColorDropdownVisible}
            setVisible={setIsUnfocusedColorDropdownVisible}
          />

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
          {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={{
              backgroundColor: '#f1f1f1',
              padding: 10,
              alignItems: 'flex-end',
            }}>
              <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                <Text style={{ fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
      )}
        </View>
        </ScrollView>
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
    paddingTop: 10,
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
},
colorPickerContainer:  { width: '100%', marginBottom: 12 },
  colorDropdownButton:   { flexDirection: 'row', alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: 'white', gap: 10 },
  colorDropdownText:     { flex: 1, fontSize: 15 },
  dropdownChevron:       { fontSize: 14, color: '#555' },
  colorSwatch:           { width: 22, height: 22, borderRadius: 4 },
  colorModalContent:     { backgroundColor: 'white', borderRadius: 12, width: '80%', maxHeight: '60%', padding: 16 },
  colorModalTitle:       { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  colorItem:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  colorItemSelected:     { backgroundColor: '#f0f6ff' },
  colorItemLabel:        { flex: 1, fontSize: 15 },
  colorItemCheck:        { fontSize: 16, color: '#007bff', fontWeight: 'bold' },

});