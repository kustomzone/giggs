import React from 'react';
import Select from 'react-select-plus';

const SelectionComponent = (props) => {
  console.log('props in select:', props);
  return (
    <Select
      {...props.input}
      options={props.options}
      onBlur={() => props.input.onBlur(props.input.value)}
      // onBlur={() => {
      //   props.input.onBlur(props.input.value);
      // }}
    />
    );
};

export default SelectionComponent;
