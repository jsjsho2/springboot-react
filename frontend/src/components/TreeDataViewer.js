import React, {useEffect, useState} from "react";
import {Input, Radio, Tree} from "antd";
import "antd/dist/antd.css";
import * as common from "./CommonFunction";
import {CCol} from "@coreui/react";

const {DirectoryTree} = Tree;
const {Search} = Input;

const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }

    return parentKey;
};

const TreeDataViewer = (props) => {

    const [data, setData] = useState(props.data[0]);
    const [expandedKeys, setExpandedKeys] = useState(props.data[1]);
    const [checkedKeys, setCheckedKeys] = useState(props.data[2]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [strictly, setStrictly] = useState(true);

    // useEffect(() => {
    //     console.log(strictly)
    // }, [strictly]);

    const dataList = [];
    const generateList = data => {
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            const {key} = node;

            dataList.push({key, title: <>{node.title}</>});
            if (node.children) {
                generateList(node.children);
            }
        }
    };
    generateList(data);

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck = (checkedKeys, info) => {
        if (props.hasOwnProperty("update")) {
            const nextInputs = props.update;
            nextInputs[info.node.key] = !info.node.checked;
            props.setUpdate(nextInputs);
        }
    };

    const onChange = e => {
        const {value} = e.target;
        const expandedKeys = dataList
            .map(item => {
                let getTitle = '';

                if (typeof (item.title) === 'object') {
                    if (item.title.hasOwnProperty('props') && item.title.props.hasOwnProperty('children') && item.title.props.children.hasOwnProperty('props')) {
                        getTitle = item.title.props.children.props.children[0];
                    } else {
                        if (item.title === 'object') {
                            getTitle = item.title.props.children[0];
                        } else {
                            getTitle = item.title.props.children;
                        }
                    }
                } else {
                    getTitle = item.title;
                }

                if (getTitle.indexOf(value) > -1) {
                    return getParentKey(item.key, data);
                }

                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    const loop = data =>
        data.map(item => {
            const getTitle = typeof (item.title) === 'object' ? item.title.props.children[0] : item.title;
            const index = getTitle.indexOf(searchValue);
            const beforeStr = getTitle.substr(0, index);
            const afterStr = getTitle.substr(index + searchValue.length);
            const title =
                index > -1 ? (
                    <>
                        {beforeStr}
                        <span className="site-tree-search-value">{searchValue}</span>
                        {afterStr}
                        {typeof (item.title) === 'object' ? (typeof (item.title.props.children[1]) === 'object' ? item.title.props.children[1] : item.title.props.children[2]) : ''}
                    </>
                ) : (
                    <>{item.title}</>
                );

            if (item.children) {
                return {
                    title,
                    key: item.key,
                    children: loop(item.children),
                    icon: item.hasOwnProperty('icon') ? item.icon : '',
                    disableCheckbox: item.hasOwnProperty('disableCheckbox') ? item.disableCheckbox : false
                };
            }

            return {
                icon: item.hasOwnProperty('icon') ? item.icon : '',
                title,
                key: item.key,
                disabled: item.hasOwnProperty('disableCheckbox') ? item.disableCheckbox : false,
            };
        });

    return (
        <>
            <Search style={{marginBottom: 8}} placeholder="Search" onChange={onChange}/>
            {/*<Radio.Group*/}
            {/*    defaultValue={true}*/}
            {/*    style={{display:'block !important'}}*/}
            {/*    options={[*/}
            {/*        {label: '단일 노드 선택', value: true},*/}
            {/*        {label: '연결된 노드 선택', value: false},*/}
            {/*    ]}*/}
            {/*    onChange={(e) => {*/}
            {/*        setStrictly(e.target.value)*/}
            {/*    }}*/}
            {/*    optionType="button"*/}
            {/*/>*/}
            <DirectoryTree
                checkable={props.hasOwnProperty("checkable") && props.checkable ? true : false}
                checkStrictly={strictly}
                defaultCheckedKeys={checkedKeys}
                showLine={{showLeafIcon: false}}
                showIcon
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={loop(data)}
                showLeafIcon={false}
                onCheck={onCheck}
                // height={400}
            />
        </>
    )
};

export default TreeDataViewer;