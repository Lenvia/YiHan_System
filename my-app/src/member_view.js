import React, { Component } from 'react';
import ReactECharts from 'echarts-for-react';
import { ensemble_json_data } from './global_definer.js'



class DisplayBox extends Component {
    displayChange(event) {
        this.props.updateDisplay(event.target.value);  // 下拉框选中的值
    }

    render() {
        return (
            <div>
                <div className="drifting_line" style={{ top: '10px', left: '40%', width: '10%', height: '10%' }}>Display: </div>
                <select id="display_selector" onChange={(event) => this.displayChange(event)} className="drifting_line" style={{ top: '10px', left: '50%', width: '15%', height: 'auto' }}>
                    <option key={'option1'} value='rendering'>rendering</option>
                    <option key={'option2'} value='radar'>radar</option>
                </select>
            </div>
        )
    }
}

class SortByBox extends Component {
    sortByChange(event) {
        // console.log(event);
        this.props.updateSortIndex(event.target.selectedIndex);  // 下拉框选中的索引
    }

    render() {
        return (
            <div>
                <div className="drifting_line" style={{ top: '10px', left: '70%', width: '10%', height: '10%' }}>Sort by: </div>
                <select id="sort_by_selector" onChange={(event) => this.sortByChange(event)} className="drifting_line" style={{ top: '10px', left: '80%', width: '15%', height: 'auto' }}>
                    <option key={'option0'} value='member_id'>member_id</option>
                    {
                        this.props.constrain_list.map((item, index) => {
                            return (
                                <option key={'option' + index} value={item}>{item}</option>
                            )
                        })
                    }
                </select>
            </div>
        )
    }
}


class RadarChartBox extends Component {

    onclick = {
        'click': this.clickMember.bind(this)
    }

    clickMember(e) {  // 点击某个Member
        // 这个方法是安全的！！！！因为
        let member_id = e.name;
        this.props.onClickMember(member_id);

    }


    renderRadarChart(option, is_valid) {
        if (is_valid)
            return (
                <div className={("valid_border")} style={{ width: '100%', height: '100%' }}>
                    <ReactECharts option={option}
                        style={{
                            position: 'absolute',
                            left: '0%',
                            right: '0%',
                            width: '100%',
                            height: '100%',
                        }}
                        onEvents={this.onclick}
                    />
                </div>
            )
        else return (
            <div style={{ width: '100%', height: '100%' }}>
                <ReactECharts option={option}
                    style={{
                        position: 'absolute',
                        left: '0%',
                        right: '0%',
                        width: '100%',
                        height: '100%',
                    }}
                    onEvents={this.onclick}
                />
            </div>
        )

    }

    get_bias(current_props) {
        let index = current_props.index;

        let margin_left = 3, margin_top = 5;
        let gap_left = 2, gap_top = 4;
        let left_bias, top_bias;

        // 注意，如果要修改这里，记得同步修改 css 中的 .member_block
        let local_width = 30;
        let local_height = 40;

        left_bias = margin_left + (index % 3) * (gap_left + local_width);
        top_bias = margin_top + Math.floor(index / 3) * (gap_top + local_height);

        return [left_bias, top_bias]
    }

    setOption(current_props) {
        let name = current_props.object["name"];
        let obj_data = current_props.object["data"];

        let indicator = [];
        let value = [];

        for (let key in obj_data) {
            indicator.push({
                name: key,
            });
            value.push(obj_data[key]);
        }

        let option = {
            title: {
                text: name,
                textStyle: {
                    fontStyle: 'normal',//'italic'(倾斜) | 'oblique'(倾斜体) ，字体风格
                    fontSize: 12,//字体大小
                    lineHeight: 18,//字体行高
                },
            },
            triggerEvent: true,
            tooltip: {
                trigger: 'item',
                confine: true,
                textStyle: {
                    fontSize: '12',
                    extraCssText: 'white-space: normal; word-break: break-all;'
                }
            },
            grid: {
                top: '5%',
                left: '0',
                right: '0',
                bootom: '0',
            },
            radar: {
                // shape: 'circle',
                indicator: indicator,
                nameGap: 3,
                radius: 45,
                name: {
                    formatter: function (text) {
                        // console.log(text);
                        let bracket = text.indexOf("(");
                        if (bracket === -1)  // 不含括号 不是很长 直接return
                            return text;

                        text = text.slice(0, bracket) + '\n' + text.slice(bracket, text.length);  // 太长了，在中间加个换行符
                        return text
                    },
                },
            },
            series: [
                {
                    type: 'radar',
                    data: [{
                        value: value,
                        name: name,  // 这个必须设置！！后期点击就是来寻找这个name 来得到member_id
                    },]
                }
            ]
        };

        return option;
    }

    render() {
        let [left_bias, top_bias] = this.get_bias(this.props);

        let option = this.setOption(this.props);

        let is_valid = this.props.is_valid;  // 如果为 true，加边框


        return (
            <div className='member_block'
                style={{
                    left: String(left_bias) + '%',
                    top: String(top_bias) + '%',

                }}>
                {
                    this.renderRadarChart(option, is_valid)
                }
            </div>
        )
    }
}

class RenderingPicture extends Component {

    clickMember(e) {  // 点击某个Member
        // 这个方法很危险！！！！
        // 获取的是图片 <img> 的 id，所以在构建的时候 id 一定要注意
        let redering_img_id = e.target.id;

        // rendering_img_memberxxx，取memberxxx
        let member_id = redering_img_id.slice(redering_img_id.indexOf("member"), redering_img_id.length);
        this.props.onClickMember(member_id);

    }

    renderRendering(object, is_valid) {
        let name = object["name"];
        let img_src = object["path"];



        // 图片 maxWidth 设置为 98% 是为 border留出宽度
        // 注：img 的id 千万不能随便改
        if (is_valid)
            return (
                <div className={("valid_border")} style={{ width: '100%', height: '100%' }} >
                    <p style={{ position: 'absolute', width: '100%', height: '10%' }}>{name}</p>
                    <img id={"rendering_img_" + name} onClick={(e) => this.clickMember(e)} src={img_src} style={{ position: 'absolute', top: '10%', left:'5%', maxWidth: '90%', }} alt="" />
                </div>

            )
        else
            return (
                <div style={{ width: '100%', height: '100%' }}>
                    <p style={{ position: 'absolute', width: '100%', height: '10%' }}>{name}</p>
                    <img id={"rendering_img_" + name} onClick={(e) => this.clickMember(e)} src={img_src} style={{ position: 'absolute', top: '10%', left:'5%', maxWidth: '90%', }} alt="" />
                </div>
            )
    }
    get_bias(current_props) {
        let index = current_props.index;

        let margin_left = 3, margin_top = 5;
        let gap_left = 2, gap_top = 4;
        let left_bias, top_bias;

        // 注意，这里的高度要大一些
        let local_width = 30;
        let local_height = 50;

        left_bias = margin_left + (index % 3) * (gap_left + local_width);
        top_bias = margin_top + Math.floor(index / 3) * (gap_top + local_height);

        return [left_bias, top_bias]
    }

    render() {
        let [left_bias, top_bias] = this.get_bias(this.props);


        let is_valid = this.props.is_valid;  // 如果为 true，加边框


        return (
            <div className='member_block'
                style={{
                    height: '50%',
                    left: String(left_bias) + '%',
                    top: String(top_bias) + '%',

                }}>
                {
                    this.renderRendering(this.props.object, is_valid)
                }
            </div>
        )
    }
}


class MemberPic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoad: false,
            data_list: [],
            valid_members: [],
        };
    }

    // 当点击某个member的子视图
    onClickMember(selected_member_id) {
        // console.log(selected_member_id);
        this.props.updateSelectedMemberId(selected_member_id);
    }



    renderRadar(item, is_valid, index) {
        // console.log(item, is_valid)
        return (
            <RadarChartBox key={'rdc' + item['name']} object={item} is_valid={is_valid} index={index}
                onClickMember={this.onClickMember.bind(this)}
            />

        )
    }

    renderRendering(item, is_valid, index) {
        // console.log(item, is_valid)
        return (
            <RenderingPicture key={'rdp' + item['name']} object={item} is_valid={is_valid} index={index}
                onClickMember={this.onClickMember.bind(this)}
            />

        )
    }


    componentDidUpdate(props) {  // props 是之前的参数，this.props是刚传来的参数

        // 如果状态没有改变，就不修改
        if (props.current_sort_index === this.props.current_sort_index
            && props.display_way === this.props.display_way
            && props.selected_xAxis_index === this.props.selected_xAxis_index
            && props.dataset_name === this.props.dataset_name
            && props.current_constrain_index === this.props.current_constrain_index
        )
            return;

        this.setState({  // 先禁止渲染
            isLoad: false,
        })

        // 约束计算相关变量
        let constrain = this.props.constrain;
        let constrain_value = this.props.constrain_value;
        let operator = this.props.operator;

        // sort相关变量，只需约束名就行了
        let current_sort_index = this.props.current_sort_index;  // 排序索引
        let sort_constrain = this.props.sort_constrain;
        let dataset_name = this.props.dataset_name;
        let member_num = this.props.member_num;


        let t_index = this.props.selected_xAxis_index;  // 选择的时间索引

        let display_way = this.props.display_way;  // 显示方式

        if (t_index === undefined || constrain === undefined)  // 还没传来数据，禁止加载！
            return;

        if (current_sort_index === 0)
            sort_constrain = 'member_id';


        // 无论何种显示方式，无论怎么排序，符合约束的member是固定的
        var valid_members = this.getValidList(
            dataset_name,
            member_num,
            constrain,
            operator,
            constrain_value,
            t_index);

        if (display_way === 'radar') {
            let radar_json_path = dataset_name + '/MemberRadar/memberViewSample_t' + t_index + '.json';

            var _this = this;

            fetch(radar_json_path, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (radar_json) {
                    // 获取到了radar_json
                    // console.log(radar_json)
                    // console.log(sort_constrain);

                    var data_list = _this.getSortedRadarDataList(
                        dataset_name,
                        member_num,
                        current_sort_index,
                        sort_constrain,
                        t_index,
                        radar_json);

                    _this.setState({
                        isLoad: true,
                        display_way: display_way,
                        data_list: data_list,
                        valid_members: valid_members,
                    })
                })
        }
        else if (display_way === 'rendering') {

            var data_list = this.getSortedRenderingDataList(
                dataset_name,
                member_num,
                current_sort_index,
                sort_constrain,
                t_index)

            this.setState({
                isLoad: true,
                display_way: display_way,
                data_list: data_list,
                valid_members: valid_members,
            })
        }

    }


    // componentDidMount() 方法在组件挂载后（插入 DOM 树中）立即调用。
    // 第一次挂载
    componentDidMount() {

    }


    // 判断是否满足 cur op constrain_value
    judgeAnswer(cur, operator, constrain_value) {
        cur = parseFloat(cur);
        constrain_value = parseFloat(constrain_value);
        switch (operator) {
            case ">":
                return cur > constrain_value;
            case "<":
                return cur < constrain_value;
            case ">=":
                return cur >= constrain_value;
            case "<=":
                return cur <= constrain_value;
            case "=":
                return cur === constrain_value;
            default:
                return false;
        }
    }

    // 根据 ensemble 下拉框的约束，得到合法的member，等会用黑线框起来
    getValidList(dataset_name, member_num, constrain, operator, constrain_value, t_index) {
        let valid_members = [];  // 满足约束的
        let members_data = ensemble_json_data[dataset_name][constrain];

        for (let i = 1; i <= member_num; i++) {
            let name = "member" + String(i);
            // 如果满足条件

            let cur = members_data[name][t_index];

            // console.log(cur, operator, constrain_value);
            if (this.judgeAnswer(cur, operator, constrain_value)) {
                valid_members.push(name);
            }
        }
        return valid_members;
    }

    getSortedRadarDataList(dataset_name, member_num, current_sort_index, sort_constrain, t_index, radar_json) {
        var data_list = [];
        if (current_sort_index === 0) {  // 根据member_id sort
            for (let i = 1; i <= member_num; i++) {
                let name = "member" + String(i);

                data_list.push({
                    "name": name,
                    "data": radar_json[name],
                })

            }
            return data_list;
        }


        let raw_data = [];
        let members_data = ensemble_json_data[dataset_name][sort_constrain];

        for (let i = 1; i <= member_num; i++) {
            let name = "member" + String(i);
            let cur = members_data[name][t_index];
            raw_data.push([name, cur]);  // 把 name 和 cur 放进去，用于排序
        }


        // 根据 current_sort_constrain 排序
        raw_data.sort(function (a, b) {  // [name, cur]，比较 cur1 和 cur2的大小
            return a[1] - b[1];
        })
        // 此时图的顺序就是 raw_data的第一维度
        // 把所有的数据装入到 data_list = [] 中
        raw_data.forEach(function (item) {
            data_list.push({
                "name": item[0],
                "data": radar_json[item[0]],
            });
        })

        return data_list;
    }

    getSortedRenderingDataList(dataset_name, member_num, current_sort_index, sort_constrain, t_index) {
        var data_list = [];
        if (current_sort_index === 0) {  // 根据member_id sort


            for (let i = 1; i <= member_num; i++) {
                let name = "member" + String(i);
                let path = dataset_name + '/MemberRendering/t' + t_index + '/m' + String(i) + '.png';

                data_list.push({
                    "name": name,
                    "path": path,
                })

            }
            return data_list;
        }


        let raw_data = [];
        let members_data = ensemble_json_data[dataset_name][sort_constrain];

        for (let i = 1; i <= member_num; i++) {
            let name = "member" + String(i);
            let cur = members_data[name][t_index];
            raw_data.push([name, cur]);  // 把 name 和 cur 放进去，用于排序
        }


        // 根据 current_sort_constrain 排序
        raw_data.sort(function (a, b) {  // [name, cur]，比较 cur1 和 cur2的大小
            return a[1] - b[1];
        })
        // 此时图的顺序就是 raw_data的第一维度
        // 把所有的数据装入到 data_list = [] 中
        raw_data.forEach(function (item) {
            let name = item[0];
            let i = name.slice(6, name.length)  // 序号

            let path = dataset_name + '/MemberRendering/t' + t_index + '/m' + String(i) + '.png';
            data_list.push({
                "name": item[0],
                "path": path,
            });
        })

        return data_list;
    }

    render() {

        if (this.state.isLoad) {
            // console.log(this.state.data_list)
            // console.log(this.state.valid_members)
            if (this.state.display_way === 'rendering') {
                return (
                    <div className='member_window' style={{}}>
                        {
                            this.state.data_list.map((item, index) => {
                                let is_valid = false;
                                if (this.state.valid_members.indexOf(item['name']) !== -1) {  // 如果当前member是符合约束的，加个框框
                                    is_valid = true;
                                }
                                return this.renderRendering(item, is_valid, index);
                            })
                        }
                    </div>

                )
            }
            else if (this.state.display_way === 'radar') {
                return (
                    <div className='member_window' style={{}}>

                        {
                            this.state.data_list.map((item, index) => {
                                let is_valid = false;
                                if (this.state.valid_members.indexOf(item['name']) !== -1) {  // 如果当前member是符合约束的，加个框框
                                    is_valid = true;
                                }
                                return this.renderRadar(item, is_valid, index);
                            })
                        }

                    </div>

                )
            }
            else {
                return (
                    <div style={{ width: "100%", height: "100%" }}>
                        error
                    </div>

                )
            }

        }
        else {
            return (
                <div style={{ width: "100%", height: "100%" }}>
                    DATA NOT READY
                </div>
            )
        }


        // if (display_way === 'rendering') {

        // }
        // else if (display_way === 'radar') {

        // }



    }
}

export { DisplayBox, SortByBox, MemberPic }