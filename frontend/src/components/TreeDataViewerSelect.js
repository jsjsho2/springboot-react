import React, {useState} from "react";
import {TreeSelect} from "antd";
import "antd/dist/antd.css";
import PropTypes from "prop-types";

const {SHOW_CHILD} = TreeSelect;

const TreeDataViewerSelect = (props) => {

    const [value, setValue] = useState(undefined);

    const onChangeInput = inputValue => {
        setValue(inputValue);
        props.update(inputValue)
    };

    return (
        <>
            <TreeSelect
                showSearch
                style={{width: '100%'}}
                value={value}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                placeholder="Please select"
                allowClear
                multiple
                treeDefaultExpandAll
                treeData={props.data[0]}
                onChange={onChangeInput}
                treeLine={{showLeafIcon: false}}
                treeDefaultExpandedKeys={props.data[1]}
                treeCheckStrictly={true}
                treeCheckable={true}
                showCheckedStrategy={SHOW_CHILD}
            >
            </TreeSelect>
        </>
    )
};

export default TreeDataViewerSelect;

TreeDataViewerSelect.propTypes = {
    data: PropTypes.any,
    update: PropTypes.any,
};
