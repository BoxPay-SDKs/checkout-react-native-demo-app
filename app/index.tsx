import { Link } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* <Link href={"/check"} style={styles.buttonText}>Open Checkout By Default</Link> */}
      <Link href={"/enterTokenScreen"} style={styles.buttonText}>Open Checkout By Enter Token</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    marginBottom: 30,
  }
});


// import { BoxpayCheckout, BoxpayElements } from 'boxpay-checkout-reactnative-sdk';
// import {
//   ConfigurationOptions,
//   PaymentResultObject,
//   SICheckboxState,
//   UIConfigurationOptions,
// } from 'boxpay-checkout-reactnative-sdk/interface';
// import { useState } from 'react';
// import {
//   Button,
//   FlatList,
//   InputAccessoryView,
//   Keyboard,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { TextInput } from 'react-native-paper';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const Index = () => {
//   const [tokenTextInput, setTokenTextInput] = useState('');
//   const [shopperTokenTextInput, setShopperTokenTextInput] = useState('');
//   const [environment, setEnvironment] = useState('test');
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
//   const [token, setToken] = useState<string | null>(null);
//   const [shopperToken, setShopperToken] = useState<string | null>(null);
//   const [ctaBorderRadius, setCtaBorderRadius] = useState('');
//   const [siCheckboxState, setSICheckboxState] = useState<SICheckboxState | null>(null);
//   const [isSIDropdownVisible, setIsSIDropdownVisible] = useState(false);
//   const [showSuccessScreen, setShowSuccessScreen] = useState(true);
//   const [showFailureScreen, setShowFailureScreen] = useState(true);

//   // ─── Font (single name, resolved by the SDK catalog) ─────────────────────────
//   const [fontFamily, setFontFamily] = useState('Default');
//   const [isFontDropdownVisible, setIsFontDropdownVisible] = useState(false);

//   // ─── Payment methods (empty → full checkout, else → elements) ────────────────
//   const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
//   const [isMethodsDropdownVisible, setIsMethodsDropdownVisible] = useState(false);

//   // ─── Color state ─────────────────────────────────────────────────────────────
//   const [focusedBorderColor, setFocusedBorderColor] = useState<string | null>(null);
//   const [borderColor, setBorderColor] = useState<string | null>(null);
//   const [isFocusedColorDropdownVisible, setIsFocusedColorDropdownVisible] = useState(false);
//   const [isUnfocusedColorDropdownVisible, setIsUnfocusedColorDropdownVisible] = useState(false);

//   const inputAccessoryViewID = 'checkoutDetailsNumberID';

//   // ─── Options ─────────────────────────────────────────────────────────────────
//   const FONT_OPTIONS = [
//     { label: 'Default', value: '' }, // empty → SDK falls back to Poppins
//     { label: 'Arial', value: 'arial' },
//     { label: 'NotoSans', value: 'notosans' },
//   ];

//   const AVAILABLE_METHODS = ['UPI', 'CARDS', 'WALLET', 'NETBANKING', 'BUYNOWPAYLATER', 'EMI'];

//   const COLOR_OPTIONS = [
//     { label: 'None', value: null, hex: 'transparent' },
//     { label: 'Red', value: '#E53935', hex: '#E53935' },
//     { label: 'Black', value: '#000000', hex: '#000000' },
//     { label: 'Blue', value: '#1E88E5', hex: '#1E88E5' },
//     { label: 'Pink', value: '#E91E8C', hex: '#E91E8C' },
//     { label: 'Purple', value: '#8E24AA', hex: '#8E24AA' },
//     { label: 'Light Blue', value: '#29B6F6', hex: '#29B6F6' },
//     { label: 'Green', value: '#43A047', hex: '#43A047' },
//     { label: 'Orange', value: '#FB8C00', hex: '#FB8C00' },
//     { label: 'Teal', value: '#00897B', hex: '#00897B' },
//     { label: 'Indigo', value: '#3949AB', hex: '#3949AB' },
//     { label: 'Yellow', value: '#FDD835', hex: '#FDD835' },
//   ];

//   const SI_CHECKBOX_OPTIONS = [
//     { label: 'None', value: null },
//     { label: 'Checked & Enabled', value: SICheckboxState.CHECKED_AND_ENABLED },
//     { label: 'Checked & Disabled', value: SICheckboxState.CHECKED_AND_DISABLED },
//     { label: 'Unchecked & Enabled', value: SICheckboxState.UNCHECKED_AND_ENABLED },
//   ];

//   const environments = [
//     { label: 'Test', value: 'test' },
//     { label: 'Production', value: 'prod' },
//   ];

//   // ─── Helpers ─────────────────────────────────────────────────────────────────
//   const getColorLabel = (value: string | null) =>
//     COLOR_OPTIONS.find((c) => c.value === value)?.label ?? 'None';

//   const getSILabel = (value: SICheckboxState | null) =>
//     SI_CHECKBOX_OPTIONS.find((opt) => opt.value === value)?.label || 'None';

//   const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

//   const selectEnvironment = (value: string) => {
//     setEnvironment(value);
//     setIsDropdownVisible(false);
//   };

//   const handleProceedPress = () => {
//     setShopperToken(shopperTokenTextInput);
//     setToken(tokenTextInput);
//   };

//   const handlePaymentResult = (result: PaymentResultObject) => {
//     alert(`Payment ${result.status} : ${result.transactionId} ${result.inquiryToken}`);
//     setToken('');
//   };

//   const toggleMethod = (method: string) => {
//     setSelectedMethods((prev) =>
//       prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
//     );
//   };

//   const textInputFields =
//     focusedBorderColor || borderColor
//       ? {
//           ...(focusedBorderColor && { focusedBorderColor }),
//           ...(borderColor && { borderColor }),
//         }
//       : null;

//   // The font value sent to the SDK: "" for Default, else the lowercase catalog key
//   const fontValue = FONT_OPTIONS.find((f) => f.label === fontFamily)?.value ?? '';

//   // Shared config passed to both checkout and elements
//   const configurationOptions = {
//     [ConfigurationOptions.ShowBoxpaySuccessScreen]: showSuccessScreen,
//     [ConfigurationOptions.EnableSandboxEnv]: environment === 'test',
//     [ConfigurationOptions.SICheckBoxState]: siCheckboxState,
//     [ConfigurationOptions.ShowBoxpayFailedScreen]: showFailureScreen,
//   };

//   const uiConfiguration = {
//     ...(fontValue !== '' && {
//       [UIConfigurationOptions.FontFamily]: fontValue,
//     }),
//     [UIConfigurationOptions.CTABorderRadius]: Number(ctaBorderRadius),
//     ...(textInputFields && {
//       [UIConfigurationOptions.TextInputFields]: textInputFields,
//     }),
//   };

//   // ─── Reusable color-picker row ───────────────────────────────────────────────
//   const ColorPickerRow = ({
//     label,
//     selected,
//     onSelect,
//     isVisible,
//     setVisible,
//   }: {
//     label: string;
//     selected: string | null;
//     onSelect: (v: string | null) => void;
//     isVisible: boolean;
//     setVisible: (v: boolean) => void;
//   }) => (
//     <View style={styles.colorPickerContainer}>
//       <Text style={styles.label}>{label}</Text>
//       <TouchableOpacity style={styles.colorDropdownButton} onPress={() => setVisible(true)}>
//         <View
//           style={[
//             styles.colorSwatch,
//             {
//               backgroundColor: selected ?? 'transparent',
//               borderWidth: selected ? 0 : 1,
//               borderColor: '#ccc',
//             },
//           ]}
//         />
//         <Text style={styles.colorDropdownText}>{getColorLabel(selected)}</Text>
//         <Text style={styles.dropdownChevron}>▾</Text>
//       </TouchableOpacity>

//       <Modal visible={isVisible} animationType="fade" transparent>
//         <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
//           <View style={styles.colorModalContent}>
//             <Text style={styles.colorModalTitle}>{label}</Text>
//             <FlatList
//               data={COLOR_OPTIONS}
//               keyExtractor={(item) => item.label}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[styles.colorItem, selected === item.value && styles.colorItemSelected]}
//                   onPress={() => {
//                     onSelect(item.value);
//                     setVisible(false);
//                   }}
//                 >
//                   <View
//                     style={[
//                       styles.colorSwatch,
//                       {
//                         backgroundColor: item.hex,
//                         borderWidth: item.value === null ? 1 : 0,
//                         borderColor: '#ccc',
//                       },
//                     ]}
//                   />
//                   <Text style={styles.colorItemLabel}>{item.label}</Text>
//                   {selected === item.value && <Text style={styles.colorItemCheck}>✓</Text>}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: 'white' }}>
//       {token ? (
//         <SafeAreaView style={{ flex: 1 }}>
//           {selectedMethods.length > 0 ? (
//             <BoxpayElements
//               key={token}
//               token={token}
//               paymentMethodList={selectedMethods}
//               configurationOptions={configurationOptions}
//               uiConfiguration={uiConfiguration}
//               onPaymentResult={handlePaymentResult}
//               shopperToken={shopperToken}
//             />
//           ) : (
//             <BoxpayCheckout
//               key={token}
//               token={token}
//               configurationOptions={configurationOptions}
//               uiConfiguration={uiConfiguration}
//               onPaymentResult={handlePaymentResult}
//               shopperToken={shopperToken}
//             />
//           )}
//         </SafeAreaView>
//       ) : (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ paddingBottom: 40, paddingTop: 60 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.container}>
//             <TextInput
//               mode="outlined"
//               label="Enter Token"
//               value={tokenTextInput}
//               onChangeText={setTokenTextInput}
//               inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
//               style={styles.textInput}
//             />
//             <TextInput
//               mode="outlined"
//               label="Enter Shopper Token"
//               value={shopperTokenTextInput}
//               onChangeText={setShopperTokenTextInput}
//               inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
//               style={styles.textInput}
//             />
//             <TextInput
//               mode="outlined"
//               label="CTA Border Radius"
//               value={ctaBorderRadius}
//               onChangeText={(val) => setCtaBorderRadius(val.replace(/[^0-9]/g, ''))}
//               keyboardType="numeric"
//               inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
//               style={styles.textInput}
//             />

//             {/* Success Screen Checkbox */}
//             <View style={styles.checkBoxContainer}>
//               <TouchableOpacity onPress={() => setShowSuccessScreen(!showSuccessScreen)}>
//                 <View
//                   style={[
//                     styles.checkboxBox,
//                     { borderColor: '#007bff' },
//                     showSuccessScreen && { backgroundColor: '#007bff' },
//                   ]}
//                 >
//                   {showSuccessScreen && <Text style={styles.checkmark}>✓</Text>}
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.checkBoxText}>Show Success Screen</Text>
//             </View>

//             {/* Failure Screen Checkbox */}
//             <View style={styles.checkBoxContainer}>
//               <TouchableOpacity onPress={() => setShowFailureScreen(!showFailureScreen)}>
//                 <View
//                   style={[
//                     styles.checkboxBox,
//                     { borderColor: '#007bff' },
//                     showFailureScreen && { backgroundColor: '#007bff' },
//                   ]}
//                 >
//                   {showFailureScreen && <Text style={styles.checkmark}>✓</Text>}
//                 </View>
//               </TouchableOpacity>
//               <Text style={styles.checkBoxText}>Show Failure Screen</Text>
//             </View>

//             {/* Font Family dropdown */}
//             <Text style={styles.label}>Font Family:</Text>
//             <TouchableOpacity
//               style={styles.dropdownButton}
//               onPress={() => setIsFontDropdownVisible(true)}
//             >
//               <Text>{fontFamily}</Text>
//             </TouchableOpacity>

//             <Modal visible={isFontDropdownVisible} animationType="slide" transparent>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={FONT_OPTIONS}
//                     keyExtractor={(item) => item.label}
//                     renderItem={({ item }) => (
//                       <TouchableOpacity
//                         style={styles.dropdownItem}
//                         onPress={() => {
//                           setFontFamily(item.label);
//                           setIsFontDropdownVisible(false);
//                         }}
//                       >
//                         <Text>{item.label}</Text>
//                       </TouchableOpacity>
//                     )}
//                   />
//                   <Button title="Close" onPress={() => setIsFontDropdownVisible(false)} />
//                 </View>
//               </View>
//             </Modal>

//             {/* Payment Methods multi-select */}
//             <Text style={styles.label}>Payment Methods:</Text>
//             <TouchableOpacity
//               style={styles.dropdownButton}
//               onPress={() => setIsMethodsDropdownVisible(true)}
//             >
//               <Text>
//                 {selectedMethods.length
//                   ? selectedMethods.join(', ')
//                   : 'All Payment Methods (Checkout)'}
//               </Text>
//             </TouchableOpacity>

//             <Modal visible={isMethodsDropdownVisible} animationType="slide" transparent>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={AVAILABLE_METHODS}
//                     keyExtractor={(item) => item}
//                     renderItem={({ item }) => {
//                       const isSelected = selectedMethods.includes(item);
//                       return (
//                         <TouchableOpacity
//                           style={styles.dropdownItem}
//                           onPress={() => toggleMethod(item)}
//                         >
//                           <View style={styles.methodRow}>
//                             <View
//                               style={[
//                                 styles.checkboxBox,
//                                 { borderColor: '#007bff' },
//                                 isSelected && { backgroundColor: '#007bff' },
//                               ]}
//                             >
//                               {isSelected && <Text style={styles.checkmark}>✓</Text>}
//                             </View>
//                             <Text>{item}</Text>
//                           </View>
//                         </TouchableOpacity>
//                       );
//                     }}
//                   />
//                   <Button title="Done" onPress={() => setIsMethodsDropdownVisible(false)} />
//                 </View>
//               </View>
//             </Modal>

//             <Text style={styles.label}>Select Environment:</Text>
//             <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
//               <Text>
//                 {environments.find((env) => env.value === environment)?.label ||
//                   'Select Environment'}
//               </Text>
//             </TouchableOpacity>

//             {/* Color pickers */}
//             <ColorPickerRow
//               label="Text Input Focused Color:"
//               selected={focusedBorderColor}
//               onSelect={setFocusedBorderColor}
//               isVisible={isFocusedColorDropdownVisible}
//               setVisible={setIsFocusedColorDropdownVisible}
//             />
//             <ColorPickerRow
//               label="Text Input Unfocused Color:"
//               selected={borderColor}
//               onSelect={setBorderColor}
//               isVisible={isUnfocusedColorDropdownVisible}
//               setVisible={setIsUnfocusedColorDropdownVisible}
//             />

//             <Text style={styles.label}>SI Checkbox State:</Text>
//             <TouchableOpacity
//               style={styles.dropdownButton}
//               onPress={() => setIsSIDropdownVisible(true)}
//             >
//               <Text>{getSILabel(siCheckboxState)}</Text>
//             </TouchableOpacity>

//             <Modal visible={isSIDropdownVisible} animationType="slide" transparent>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={SI_CHECKBOX_OPTIONS}
//                     keyExtractor={(item) => item.label}
//                     renderItem={({ item }) => (
//                       <TouchableOpacity
//                         style={styles.dropdownItem}
//                         onPress={() => {
//                           setSICheckboxState(item.value);
//                           setIsSIDropdownVisible(false);
//                         }}
//                       >
//                         <Text>{item.label}</Text>
//                       </TouchableOpacity>
//                     )}
//                   />
//                   <Button title="Close" onPress={() => setIsSIDropdownVisible(false)} />
//                 </View>
//               </View>
//             </Modal>

//             <Pressable style={styles.proceedButton} onPress={handleProceedPress}>
//               <Text style={styles.proceedButtonText}>Proceed</Text>
//             </Pressable>

//             <Modal visible={isDropdownVisible} animationType="slide" transparent>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <FlatList
//                     data={environments}
//                     keyExtractor={(item) => item.value}
//                     renderItem={({ item }) => (
//                       <TouchableOpacity
//                         style={styles.dropdownItem}
//                         onPress={() => selectEnvironment(item.value)}
//                       >
//                         <Text>{item.label}</Text>
//                       </TouchableOpacity>
//                     )}
//                   />
//                   <Button title="Close" onPress={toggleDropdown} />
//                 </View>
//               </View>
//             </Modal>

//             {Platform.OS === 'ios' && (
//               <InputAccessoryView nativeID={inputAccessoryViewID}>
//                 <View style={{ backgroundColor: '#f1f1f1', padding: 10, alignItems: 'flex-end' }}>
//                   <TouchableOpacity onPress={() => Keyboard.dismiss()}>
//                     <Text style={{ fontSize: 16 }}>Done</Text>
//                   </TouchableOpacity>
//                 </View>
//               </InputAccessoryView>
//             )}
//           </View>
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// export default Index;

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', padding: 20 },
//   textInput: { width: '100%', borderRadius: 8, backgroundColor: 'white', marginBottom: 10 },
//   label: { fontSize: 16, marginBottom: 5, alignSelf: 'flex-start' },
//   dropdownButton: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: 'white',
//     alignItems: 'flex-start',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
//   dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
//   methodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   proceedButton: {
//     width: '100%',
//     backgroundColor: '#007bff',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   proceedButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
//   checkBoxContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
//   checkboxBox: {
//     width: 20,
//     height: 20,
//     borderWidth: 2,
//     borderRadius: 3,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold', lineHeight: 16 },
//   checkBoxText: { color: '#2D2B32', fontSize: 14, marginLeft: 6 },
//   colorPickerContainer: { width: '100%', marginBottom: 12 },
//   colorDropdownButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 10,
//     backgroundColor: 'white',
//     gap: 10,
//   },
//   colorDropdownText: { flex: 1, fontSize: 15 },
//   dropdownChevron: { fontSize: 14, color: '#555' },
//   colorSwatch: { width: 22, height: 22, borderRadius: 4 },
//   colorModalContent: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     width: '80%',
//     maxHeight: '60%',
//     padding: 16,
//   },
//   colorModalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
//   colorItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 4,
//     gap: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   colorItemSelected: { backgroundColor: '#f0f6ff' },
//   colorItemLabel: { flex: 1, fontSize: 15 },
//   colorItemCheck: { fontSize: 16, color: '#007bff', fontWeight: 'bold' },
// });