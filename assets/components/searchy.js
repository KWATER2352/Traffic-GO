import * as React from 'react';
import { Searchbar } from 'react-native-paper';

const MySearch = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Searchbar
      placeholder="Search for a destination"
      onChangeText={setSearchQuery}
      value={searchQuery}
      style={{ marginHorizontal: 20, borderColor: '#4CAF50', borderWidth: 1 }}
    />
  );
};

export default MySearch;
