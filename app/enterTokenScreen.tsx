import { BoxpayCheckout, BoxpayElements, BoxpayElementsHandle } from 'boxpay-checkout-reactnative-sdk';
import {
  ConfigurationOptions,
  PaymentResultObject,
  SICheckboxState,
  UIConfigurationOptions,
} from 'boxpay-checkout-reactnative-sdk/interface';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// ── Constants (mirrors TokenScreen.kt) ───────────────────────────────────────

const PRESET_COLORS: { label: string; value: string | null }[] = [
  { label: 'None', value: null },
  { label: 'Charcoal', value: '#2D2B32' },
  { label: 'Grey', value: '#ADACB0' },
  { label: 'Black', value: '#000000' },
  { label: 'Blue', value: '#1A73E8' },
  { label: 'Green', value: '#1CA672' },
  { label: 'Red', value: '#E53935' },
  { label: 'Purple', value: '#7B1FA2' },
];

// Sentinel value that means "use BoxpayCheckout with all methods"
const ALL_METHODS_SENTINEL = '__ALL__';

const PAYMENT_METHODS = ['UPI', 'CARDS', 'WALLET', 'NETBANKING', 'BUYNOWPAYLATER', 'EMI'];

const FONT_FAMILY_OPTIONS: { label: string; value: string }[] = [
  { label: 'None', value: '' },
  { label: 'Default', value: 'poppins' },
  { label: 'Arial', value: 'arial' },
  { label: 'NotoSans', value: 'notosans' },
];

const PRIMARY_GREEN = '#1CA672';
const DISABLED_GREY = '#E6E6E6';
const DISABLED_TEXT = '#ADACAD';
const TEXT_DARK = '#0A090B';
const LABEL_DARK = '#2D2B32';

const inputAccessoryViewID = 'checkoutDetailsNumberID';

const elementsRef = useRef<BoxpayElementsHandle>(null);
const [isPayable, setIsPayable] = useState(false);

const ToggleRow = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#D9D9D9', true: PRIMARY_GREEN }}
      thumbColor="#ffffff"
    />
  </View>
);

const ColorPickerField = ({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string | null;
  onChange: (v: string | null) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [customHex, setCustomHex] = useState('');
  const isCustom = selected !== null && !PRESET_COLORS.some((c) => c.value === selected);

  const selectedLabel = isCustom
    ? 'Custom'
    : PRESET_COLORS.find((c) => c.value === selected)?.label ?? 'None';

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsVisible(true)}>
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
        <Text style={styles.dropdownButtonText}>{selectedLabel}</Text>
        <Text style={styles.dropdownChevron}>▾</Text>
      </TouchableOpacity>

      {isCustom && (
        <TextInput
          mode="outlined"
          label="Hex value"
          value={selected ?? ''}
          onChangeText={(v) => onChange(v.startsWith('#') ? v : `#${v}`)}
          style={styles.textInput}
        />
      )}

      <Modal visible={isVisible} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsVisible(false)}>
          <View style={styles.colorModalContent}>
            <Text style={styles.colorModalTitle}>{label}</Text>
            <FlatList
              data={[...PRESET_COLORS, { label: 'Custom', value: customHex || '#000000' }]}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.colorItem,
                    selected === item.value && styles.colorItemSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setIsVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: item.value ?? 'transparent',
                        borderWidth: item.value ? 0 : 1,
                        borderColor: '#ccc',
                      },
                    ]}
                  />
                  <Text style={styles.colorItemLabel}>{item.label}</Text>
                  {item.value && item.label !== 'Custom' && (
                    <Text style={styles.colorItemHex}>{item.value}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// ── Payment Methods picker ────────────────────────────────────────────────────
// • Selecting "All Payment Methods (Checkout)" clears the set → BoxpayCheckout
// • Selecting any specific method(s) adds them → BoxpayElements

const PaymentMethodsField = ({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (v: Set<string>) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const isAllMethods = selected.size === 0;
  const displayText = isAllMethods
    ? 'All Payment Methods (Checkout)'
    : Array.from(selected).join(', ');

  const toggleMethod = (method: string) => {
    if (method === ALL_METHODS_SENTINEL) {
      // Deselect everything → fall back to BoxpayCheckout
      onChange(new Set());
      return;
    }
    const updated = new Set(selected);
    if (updated.has(method)) {
      updated.delete(method);
    } else {
      updated.add(method);
    }
    onChange(updated);
  };

  // Build list: "All" sentinel first, then specific methods
  const listData = [
    { key: ALL_METHODS_SENTINEL, label: 'All Payment Methods (Checkout)' },
    ...PAYMENT_METHODS.map((m) => ({ key: m, label: m })),
  ];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>Payment Methods</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsVisible(true)}>
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {displayText}
        </Text>
        <Text style={styles.dropdownChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={listData}
              keyExtractor={(item) => item.key}
              renderItem={({ item, index }) => {
                const isAllRow = item.key === ALL_METHODS_SENTINEL;
                const isSelected = isAllRow ? isAllMethods : selected.has(item.key);

                return (
                  <View>
                    {/* Divider after the "All" row */}
                    {index === 1 && <View style={styles.methodDivider} />}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        toggleMethod(item.key);
                        // Close automatically when "All" is chosen
                        if (isAllRow) setIsVisible(false);
                      }}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          { borderColor: PRIMARY_GREEN },
                          isSelected && { backgroundColor: PRIMARY_GREEN },
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isAllRow && styles.allMethodsLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const EnterTokenScreen = () => {
  // Token fields
  const [tokenTextInput, setTokenTextInput] = useState('');
  const [shopperTokenTextInput, setShopperTokenTextInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [shopperToken, setShopperToken] = useState<string | null>(null);

  // Colors
  const [focusedTextInputBorderColor, setFocusedBorderColor] = useState<string | null>('#2D2B32');
  const [unfocusedTextInputBorderColor, setUnfocusedBorderColor] = useState<string | null>('#ADACB0');

  // CTA border radius
  const [ctaBorderRadius, setCtaBorderRadius] = useState('0');

  // Payment methods — empty set means "all" (BoxpayCheckout)
  const [paymentMethods, setPaymentMethods] = useState<Set<string>>(new Set());

  // Font family
  const [fontFamily, setFontFamily] = useState('');
  const [isFontDropdownVisible, setIsFontDropdownVisible] = useState(false);

  // Toggles
  const [isTestEnv, setIsTestEnv] = useState(true);
  const [isBoxPayPayButtonVisible, setIsBoxPayPayButtonVisible] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showFailureScreen, setShowFailureScreen] = useState(false);
  const [showQROnLoad, setShowQROnLoad] = useState(false);
  const [isSICheckBoxEnabled, setIsSICheckBoxEnabled] = useState(false);
  const [isSICheckBoxChecked, setIsSICheckBoxChecked] = useState(false);

  const handleFontFamilySelect = (value: string) => {
    setFontFamily(value);
    setIsFontDropdownVisible(false);
  };

  const handleProceedPress = () => {
    if (!tokenTextInput) return;
    setShopperToken(shopperTokenTextInput);
    setToken(tokenTextInput);
  };

  const handlePaymentResult = useCallback(
    (result: PaymentResultObject) => {
      console.log('Payment Result:', result);

      // Close first — this must always happen, independent of anything below
      setToken(null);

      try {
        const status = typeof result?.status === 'string' ? result.status : String(result?.status ?? '');
        const transactionId = result?.transactionId ?? '';

        Toast.show({
          type: status.toLowerCase() === 'success' ? 'success' : 'error',
          text1: `Payment ${status}`,
          text2: `Transaction ID: ${transactionId}`,
          position: 'top',
          visibilityTime: 4000,
        });
      } catch (err) {
        console.error('Toast display failed:', err);
      }
    },
    [],
  );

  // Map the two SI booleans onto the SDK's SICheckboxState enum
  const siCheckboxState = useMemo<SICheckboxState | null>(() => {
    if (isSICheckBoxEnabled && isSICheckBoxChecked) return SICheckboxState.CHECKED_AND_ENABLED;
    if (isSICheckBoxEnabled && !isSICheckBoxChecked) return SICheckboxState.UNCHECKED_AND_ENABLED;
    if (!isSICheckBoxEnabled && isSICheckBoxChecked) return SICheckboxState.CHECKED_AND_DISABLED;
    return null;
  }, [isSICheckBoxEnabled, isSICheckBoxChecked]);

  const textInputFields =
    focusedTextInputBorderColor || unfocusedTextInputBorderColor
      ? {
          ...(focusedTextInputBorderColor && { focusedTextInputBorderColor }),
          ...(unfocusedTextInputBorderColor && { borderColor: unfocusedTextInputBorderColor }),
        }
      : null;

  const configurationOptions = {
    [ConfigurationOptions.ShowBoxpaySuccessScreen]: showSuccessScreen,
    [ConfigurationOptions.EnableSandboxEnv]: isTestEnv,
    [ConfigurationOptions.SICheckBoxState]: siCheckboxState,
    [ConfigurationOptions.ShowBoxpayFailedScreen]: showFailureScreen,
    [ConfigurationOptions.ShowBoxPayProceedButton] : true
  };

  const uiConfiguration = {
    [UIConfigurationOptions.FontFamily]: fontFamily,
    [UIConfigurationOptions.CTABorderRadius]: Number(ctaBorderRadius) || 0,
    ...(textInputFields && {
      [UIConfigurationOptions.TextInputFields]: textInputFields,
    }),
  };

  const fontFamilyLabel =
    FONT_FAMILY_OPTIONS.find((f) => f.value === fontFamily)?.label ?? 'None';

  const isProceedEnabled = tokenTextInput.trim().length > 0;

  // true  → specific methods chosen → BoxpayElements
  // false → empty set              → BoxpayCheckout
  const useElements = paymentMethods.size > 0;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
  <View style={{ flex: 1, paddingTop: 32 }}>
    {useElements ? (
      <View>
        {/* Elements fills all space above the button */}
        <BoxpayElements
          ref={elementsRef}
          key={token}
          token={token}
          configurationOptions={configurationOptions}
          uiConfiguration={uiConfiguration}
          onPaymentResult={handlePaymentResult}
          shopperToken={shopperToken}
          paymentMethodList={Array.from(paymentMethods)}
          onPayableChanged={setIsPayable}
        />

        {/* PAY button — only when SDK's own button is hidden */}
        {!isBoxPayPayButtonVisible && (
          <Pressable
            disabled={!isPayable}
            style={[
              styles.payButton,
              { backgroundColor: isPayable ? PRIMARY_GREEN : DISABLED_GREY },
            ]}
            onPress={() => elementsRef.current?.pay()}
          >
            <Text style={[
              styles.payButtonText,
              { color: isPayable ? 'white' : DISABLED_TEXT },
            ]}>
              PAY
            </Text>
          </Pressable>
        )}
      </View>
    ) : (
      <BoxpayCheckout
        key={token}
        token={token}
        configurationOptions={configurationOptions}
        uiConfiguration={uiConfiguration}
        onPaymentResult={handlePaymentResult}
        shopperToken={shopperToken}
      />
    )}
  </View>
)  : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 70, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Token ── */}
          <TextInput
            mode="outlined"
            label="Token *"
            value={tokenTextInput}
            onChangeText={setTokenTextInput}
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />

          {/* ── Shopper Token ── */}
          <TextInput
            mode="outlined"
            label="Shopper Token (optional)"
            value={shopperTokenTextInput}
            onChangeText={setShopperTokenTextInput}
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />

          {/* ── Color fields ── */}
          <ColorPickerField
            label="Focused Border Color"
            selected={focusedTextInputBorderColor}
            onChange={setFocusedBorderColor}
          />
          <ColorPickerField
            label="Unfocused Border Color"
            selected={unfocusedTextInputBorderColor}
            onChange={setUnfocusedBorderColor}
          />

          {/* ── CTA Border Radius ── */}
          <TextInput
            mode="outlined"
            label="CTA Border Radius"
            value={ctaBorderRadius}
            onChangeText={(val) => setCtaBorderRadius(val.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
            style={styles.textInput}
          />

          {/* ── Payment Methods ── */}
          <PaymentMethodsField selected={paymentMethods} onChange={setPaymentMethods} />

          {/* ── Font Family ── */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Font Family</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsFontDropdownVisible(true)}
            >
              <Text style={styles.dropdownButtonText}>{fontFamilyLabel}</Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>

            <Modal visible={isFontDropdownVisible} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={FONT_FAMILY_OPTIONS}
                    keyExtractor={(item) => item.label}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleFontFamilySelect(item.value)}
                      >
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setIsFontDropdownVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* ── Toggles ── */}
          <ToggleRow label="Test Environment" value={isTestEnv} onValueChange={setIsTestEnv} />
          <ToggleRow
            label="BoxPay Pay Button Visible (Only eligible in Elements)"
            value={isBoxPayPayButtonVisible}
            onValueChange={setIsBoxPayPayButtonVisible}
          />
          <ToggleRow
            label="Show Success Screen"
            value={showSuccessScreen}
            onValueChange={setShowSuccessScreen}
          />
          <ToggleRow
            label="Show Failed Screen"
            value={showFailureScreen}
            onValueChange={setShowFailureScreen}
          />
          <ToggleRow label="Show QR On Load" value={showQROnLoad} onValueChange={setShowQROnLoad} />
          <ToggleRow
            label="SI CheckBox Enabled"
            value={isSICheckBoxEnabled}
            onValueChange={setIsSICheckBoxEnabled}
          />
          <ToggleRow
            label="SI CheckBox Pre-Checked"
            value={isSICheckBoxChecked}
            onValueChange={setIsSICheckBoxChecked}
          />

          {/* ── Proceed button ── */}
          <Pressable
            disabled={!isProceedEnabled}
            style={[
              styles.proceedButton,
              { backgroundColor: isProceedEnabled ? PRIMARY_GREEN : DISABLED_GREY },
            ]}
            onPress={handleProceedPress}
          >
            <Text
              style={[
                styles.proceedButtonText,
                { color: isProceedEnabled ? 'white' : DISABLED_TEXT },
              ]}
            >
              Proceed
            </Text>
          </Pressable>
        </ScrollView>
      )}
      <Toast />
    </View>
  );
};

export default EnterTokenScreen;

const styles = StyleSheet.create({
  textInput: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: LABEL_DARK,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    gap: 10,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
  },
  dropdownChevron: {
    fontSize: 14,
    color: '#555',
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  toggleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: LABEL_DARK,
    marginRight: 12,
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
    maxHeight: '70%',
  },
  colorModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: '65%',
    padding: 16,
  },
  colorModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: LABEL_DARK,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorItemSelected: {
    backgroundColor: '#f0f6ff',
  },
  colorItemLabel: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
  },
  colorItemHex: {
    fontSize: 12,
    color: '#888',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 15,
    color: TEXT_DARK,
  },
  allMethodsLabel: {
    fontWeight: '600',
    color: PRIMARY_GREEN,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
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
  methodDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  modalCloseButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCloseButtonText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
    fontSize: 15,
  },
  fontStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  payButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontStatus: {
    fontSize: 12,
    color: '#555',
  },
  proceedButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});