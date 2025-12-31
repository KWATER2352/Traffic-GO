import * as React from 'react';
import { Searchbar } from 'react-native-paper';

const MySearch = ({ onSearch, placeholder = "Search for a destination" }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={setSearchQuery}
      value={searchQuery}
      onSubmitEditing={handleSearch}
      onIconPress={handleSearch}
      style={{ marginHorizontal: 20, borderColor: '#4CAF50', borderWidth: 1 }}
    />
  );
};

export default MySearch;
