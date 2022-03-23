import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';

import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import {AutoComplete, Button, DatePicker, Tag} from "antd";
import moment from 'moment';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";

const {RangePicker} = DatePicker;

const menu = {
    a0: '[권한] 상태',
    a01: '[권한] 상태 - 역할&서비스 구조',
    a02: '[권한] 상태 - 반환',
    a1: '[권한] 신청',
    a11: '[권한] 신청 - 역할&서비스 구조',
    a2: '[권한] 이력',
    a21: '[권한] 이력 - 상세',
    a22: '[권한] 이력 - 상신취소',
    a3: '[권한] 회수',
    a31: '[권한] 회수 - 역할&서비스 구조',
    a32: '[권한] 회수 - 회수',
    b0: '[결재] 목록',
    b01: '[결재] 목록 - 상세',
    c0: '[매핑] 조직&역할 (결재)',
    c01: '[매핑] 조직&역할 (결재) - 상세',
    c2: '[매핑] 조직&역할 (기본)',
    c21: '[매핑] 조직&역할 (기본) - 상세',
    c1: '[매핑] 역할&서비스',
    c11: '[매핑] 역할&서비스 - 역할&서비스 구조',
    d0: '[배치] 목록',
    d01: '[배치] 목록 - 상세',
    d1: '[배치] 로그',
    d11: '[배치] 로그 - 상세',
    e0: '[증적] 조회',
    e01: '[증적] 조회 - 상세',
    f0: '[설정] 콘솔',
};
const actions = {
    '0': '조회',
    '1': '등록',
    '2': '수정',
    '3': '삭제',
    '4': '실행',
    '5': '결재요청',
    '6': '결재',
    '7': '권한반환',
    '8': '권한회수',
    '9': '상신취소',
};

const results = [<Tag key={'tag1'} color="blue">성공</Tag>, <Tag key={'tag2'} color="red">실패</Tag>];

const Search = () => {
    const [detail, setDetail] = useState(undefined);
    const [loadings, setLoadings] = useState(true);
    const [detailVisible, setDetailVisible] = useState(false);
    const [inputs, setInputs] = useState({
        name: '',
        action: '',
        menu: '',
        startDate: common.setDefaultDateFrom(),
        endDate: common.setDefaultDateFrom(1),
    });
    const [evidenceList, setEvidenceList] = useState([]);

    const onChange = (e) => {
        const {name, value} = e.target;

        const nextInputs = {
            ...inputs,
            [name]: value,
        };
        setInputs(nextInputs)
    };
    const onDatetime = (datetime, value) => {
        const nextInputs = {
            ...inputs,
            'startDate': value[0].replaceAll('-', '/'),
            'endDate': value[1].replaceAll('-', '/'),
        };
        setInputs(nextInputs);
    };

    function detailVisibleFunc(visible) {
        setDetailVisible(visible);
    }

    async function getData() {
        setLoadings(true);

        const data = await GetData("/REST/evidence/search", inputs, '', 'auto');

        setLoadings(false);
        let returnData = [];

        if (data.length === 0 || data === '') {
            common.showGridNoRowMsg();
            return false;
        }

        for (let i = 0; i < data.length; i++) {
            const obj = {
                uuid: data[i].UUID,
                name: data[i].NAME,
                action: actions[data[i].ACTION],
                menu: menu[data[i].MENU],
                result: results[parseInt(data[i].RESULT)],
                actionDate: common.numberDateToString(data[i].ACTION_DATE),
            };

            returnData.push(obj)
        }

        setEvidenceList(returnData);
    }

    useEffect(() => {
        getData();
    }, []);

    async function details(uuid) {
        const detail = await GetData("/REST/evidence/searchOne", {uuid: uuid}, '', 'auto');

        const target = detail[0].TARGET === null ? null : JSON.parse(detail[0].TARGET);
        const before = detail[0].BEFORE === null ? null : JSON.parse(detail[0].BEFORE);
        const after = detail[0].AFTER === null ? null : JSON.parse(detail[0].AFTER);

        if (detail[0].ACTION === '5') {
            setDetail(
                <>
                    <span style={{color: '#767676'}}>ID:</span> {detail[0].USER_ID}<br/>
                    <span style={{color: '#767676'}}>이름:</span> {detail[0].NAME}<br/>
                    <span style={{color: '#767676'}}>IP:</span> {detail[0].USER_IP}<br/>
                    <span style={{color: '#767676'}}>메뉴:</span> {menu[detail[0].MENU]}<br/>
                    <span style={{color: '#767676'}}>행위:</span> {actions[detail[0].ACTION]}<br/>
                </>
            )

        } else {
            setDetail(
                <>
                    <span style={{color: '#767676'}}>ID:</span> {detail[0].USER_ID}<br/>
                    <span style={{color: '#767676'}}>이름:</span> {detail[0].NAME}<br/>
                    <span style={{color: '#767676'}}>IP:</span> {detail[0].USER_IP}<br/>
                    <span style={{color: '#767676'}}>메뉴:</span> {menu[detail[0].MENU]}<br/>
                    <span style={{color: '#767676'}}>행위:</span> {actions[detail[0].ACTION]}<br/>
                    {target && typeof target === 'object' && detail[0].ACTION === '0'
                        ? (<><span style={{color: '#767676'}}>검색조건:</span> &#123;<br/>
                            {Object.keys(target).map((key, index) => {
                                return (<div key={index}>&nbsp;&nbsp;{key} : {target[key]}<br/></div>)
                            })}
                            &#125;<br/>
                        </>)
                        : (target && typeof target === 'object'
                            ? (<><span style={{color: '#767676'}}>대상:</span> &#123;<br/>
                                {Object.keys(target).map((key, index) => {
                                    return (<div key={index}>&nbsp;&nbsp;{key} : {target[key]}<br/></div>)
                                })}
                                &#125;<br/>
                            </>)
                            : (target && <><span style={{color: '#767676'}}>대상:</span> {target.TARGET}<br/></>))
                    }
                    {before && <><span style={{color: '#767676'}}>BEFORE:</span>
                        {<> &#91;<br/>
                            {before.map((beforeChild, index) => {
                                    return (
                                        <>
                                            &#123;
                                            {Object.keys(beforeChild).map((key, index2) => {
                                                return (
                                                    after !== null
                                                        ? (after[index][key] === beforeChild[key]
                                                            ? (<div
                                                                key={`${index}${index2}`}>&nbsp;&nbsp;{key} : {beforeChild[key]}<br/>
                                                            </div>)
                                                            : (<div key={`${index}${index2}`}
                                                                    style={{color: '#d70a25'}}>&nbsp;&nbsp;{key} : {beforeChild[key]}<br/>
                                                            </div>)
                                                        )
                                                        : (<div
                                                            key={`${index}${index2}`}>&nbsp;&nbsp;{key} : {beforeChild[key]}<br/>
                                                        </div>)
                                                )
                                            })}
                                            &#125;&#44;
                                        </>
                                    )
                                }
                            )}
                            &#93;<br/>
                        </>}</>}
                    {after && <><span style={{color: '#767676'}}>AFTER:</span>
                        {<> &#91;<br/>
                            {after.map((afterChild, index) => {
                                    return (
                                        <>
                                            &#123;
                                            {Object.keys(afterChild).map((key, index2) => {
                                                return (
                                                    before !== null
                                                        ? (before.length >= (index + 1) && before[index].hasOwnProperty(key) && before[index][key] === afterChild[key]
                                                            ? (<div
                                                                key={`${index}${index2}`}>&nbsp;&nbsp;{key} : {afterChild[key]}<br/>
                                                            </div>)
                                                            : (<div key={`${index}${index2}`}
                                                                    style={{color: '#d70a25'}}>&nbsp;&nbsp;{key} : {afterChild[key]}<br/>
                                                            </div>)
                                                        )
                                                        : (
                                                            <div key={`${index}${index2}`}>&nbsp;&nbsp;{key} : {afterChild[key]}<br/>
                                                            </div>)
                                                )
                                            })}
                                            &#125;&#44;
                                        </>
                                    )
                                }
                            )}
                            &#93;<br/>
                        </>}</>}
                </>
            );
        }

        detailVisibleFunc(true)
    }

    const Details = (props) => {

        return (
            <CustomButton
                event={details}
                data={props.value}
                icon={'cil-search'}
            />
        )
    };

    const frameworkComponents = {
        details: Details
    };

    const colOption = [
        {headerName: "일시", field: "actionDate"},
        {headerName: "이름", field: "name"},
        {headerName: "메뉴", field: "menu"},
        {headerName: "행위", field: "action"},
        {headerName: "상세보기", field: "uuid", cellRenderer: 'details'},
    ];

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>조회</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol sm={2}>
                                    <CLabel>유저명</CLabel>
                                    <CInput
                                        name="name"
                                        onChange={onChange}
                                        className='ant-input'
                                    />
                                </CCol>

                                <CCol sm={2}>
                                    <CLabel>메뉴</CLabel>
                                    <AutoComplete
                                        style={{width: '100%'}}
                                        onChange={(value, target) => {
                                            onChange({target: {name: 'menu', value: target.data}});
                                        }}
                                        options={[
                                            {value: '전체', data: ''},
                                            {value: '권한 상태', data: 'a0'},
                                            {value: '권한 신청', data: 'a1'},
                                            {value: '권한 이력', data: 'a2'},
                                            {value: '권한 회수', data: 'a3'},
                                            {value: '결재 목록', data: 'b0'},
                                            {value: '매핑 조직&역할', data: 'c0'},
                                            {value: '매핑 역할&서비스', data: 'c1'},
                                            {value: '배치 목록', data: 'd0'},
                                            {value: '배치 로그', data: 'd1'},
                                            {value: '증적 조회', data: 'e0'},
                                        ]}
                                        placeholder="focus..."
                                        filterOption={(inputValue, option) =>
                                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                        }
                                    />
                                </CCol>

                                <CCol sm={2}>
                                    <CLabel>행위</CLabel>
                                    <AutoComplete
                                        style={{width: '100%'}}
                                        onChange={(value, target) => {
                                            onChange({target: {name: 'action', value: target.data}});
                                        }}
                                        options={[
                                            {value: '전체', data: ''},
                                            {value: '조회', data: '0'},
                                            {value: '등록', data: '1'},
                                            {value: '수정', data: '2'},
                                            {value: '삭제', data: '3'},
                                            {value: '실행', data: '4'},
                                            {value: '결재요청', data: '5'},
                                            {value: '결재', data: '6'},
                                            {value: '권한반환', data: '7'},
                                            {value: '권한회수', data: '8'},
                                            {value: '상신취소', data: '9'},
                                        ]}
                                        placeholder="focus..."
                                        filterOption={(inputValue, option) =>
                                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                        }
                                    />
                                </CCol>

                                <CCol sm={4}>
                                    <CLabel>행위 일시</CLabel>
                                    <RangePicker showTime
                                                 defaultValue={[moment(inputs.startDate), moment(inputs.endDate)]}
                                                 onChange={onDatetime}/>
                                </CCol>

                                <CCol className="function-btns" sm={2}>
                                    <Button type='primary' loading={loadings} onClick={getData}>
                                        검색
                                    </Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={evidenceList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={colOption}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={detailVisible}
                visibleFunc={detailVisibleFunc}
                title='증적 상세'
                content={detail}
            />
        </>
    )
};

export default Search;