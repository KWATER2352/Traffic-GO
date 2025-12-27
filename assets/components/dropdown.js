import DropDownPicker from 'react-native-dropdown-picker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Dropy() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState([]);
  const [items, setItems] = useState([
    {
      label: '🚧 Roadblock',
      value: 'roadblock',
    },
    {
      label: '🚗 Accident',
      value: 'accident',
    },
    {
      label: '🏗️ Construction',
      value: 'construction',
    },
    {
      label: '🚦 Heavy Traffic',
      value: 'heavy_traffic',
    },
  ]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        multiple={true}
        min={0}
        max={5}
        open={open}
        value={value}
        items={items}
        loading={loading}
        searchable={true}
        placeholder="Select incident type(s)"
        listMode="MODAL"
        modalProps={{
          animationType: "slide"
        }}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 3000,
    elevation: 3000,
  },
  dropdown: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 8,
    zIndex: 3000,
  },
  dropdownContainer: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    zIndex: 3000,
    elevation: 3000,
  },
});
