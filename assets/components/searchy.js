import * as React from 'react';
import { Searchbar } from 'react-native-paper';

const MySearch = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Searchbar
      placeholder=""
      onChangeText={setSearchQuery}
      value={searchQuery}
    />
  );
};

export default MySearch;
