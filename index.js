const svgWidth = window.innerWidth - 100;
const svgHeight = window.innerHeight - 60;
const margin = {top: 30, right: 20, bottom: 30, left: 40};
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

d3.csv("data/Sleep_health_and_lifestyle_dataset.csv").then(data => {
    // console.log(data)
    init();
    let filterData = data.map((d) => {
        return {
            "Gender": d["Gender"],
            "Age": d["Age"],
            // 职业
            "Occupation": d["Occupation"],
            // // 睡眠持续时间（小时）
            // "Sleep Duration": d["Sleep Duration"],
            // // 睡眠质量（等级：1-10）
            // "Quality of Sleep": d["Quality of Sleep"],
            // // 体力活动水平（分钟/天）
            // "Physical Activity Level": d["Physical Activity Level"],
            // // 压力水平（等级：1-10）
            // "Stress Level": d["Stress Level"],
            // // BMI 类别
            // "BMI Category": d["BMI Category"],
            // // 心率 (bpm)
            // "Heart Rate": d["Heart Rate"],
            // // 每日步数
            // "Daily Steps": d["Daily Steps"],
            // 睡眠障碍
            "Sleep Disorder": d["Sleep Disorder"],
        }
    });
    // console.log(filterData);
    // 清理数据
    let cleanData = cleaning(filterData);
    let newData = filtering(cleanData);
    drawChart(newData);
    // ColumnChartProcessing(newData)
    // LineChartProcessing(newData)
    // PieChartProcesing(newData)
})

function cleaning(data) {
    // 1）检查字段名是否正确，以及是否有额外字符；规范化字段名
    data = data.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
            const trimmedKey = key.trim(); // 移除字段名周围的空格
            newRow[trimmedKey] = row[key];
        });
        return newRow;
    });

    // console.log("1.检查字段名：")
    // console.log(data)

    // 2）数据重复值处理
    const stringifiedRows = data.map(row => JSON.stringify(row));
    const uniqueStringifiedRows = [...new Set(stringifiedRows)]; // 利用Set去重
    data = uniqueStringifiedRows.map(row => JSON.parse(row));

    // console.log("2）数据重复值处理")
    // console.log(data)

    // 3）数据缺失值、异常值处理
    data = data.filter(row => {
        return Object.values(row).every(value => value !== ' ' && value !== null);
    });

    // 打印结果，检查数据是否已清理
    // console.table(data);

    return data;
}

function filtering(data) {
    // 采样
    let sampleRate = 0.8;
    let samples = data.filter(() => Math.random() < sampleRate);
    console.log(samples)

    // 过滤
    let mappedData = samples.map((d) => {
        return {
            "Gender": d["Gender"],
            "Age": d["Age"],
            "Occupation": d["Occupation"],
            "Sleep Disorder": d["Sleep Disorder"]
        };
    });
    console.log(mappedData)

    let sortedData = mappedData.sort((a, b) => a.Age - b.Age);
    console.table(sortedData)

    return sortedData;
}

function drawChart(filterData) {
    const selectElement = document.createElement('select');
    const options = ['请选着图表', '图一 职业与睡眠水平柱状图', '图二 各年龄男女睡眠情况折线图', '图三 睡眠情况饼状图'];
    options.forEach(function (optionText) {
        const optionElement = document.createElement('option');
        optionElement.value = optionText;
        optionElement.textContent = optionText;
        selectElement.appendChild(optionElement);
    });
    document.body.appendChild(selectElement);

    selectElement.addEventListener('click', function () {
        console.log('You selected: ', this.value);
        const selectedValue = this.value;
        switch (selectedValue) {
            case '图一 职业与睡眠水平柱状图':
                ColumnChartProcessing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    console.log(d);
                    d.style.display = 'none';
                });
                document.querySelector('.column').style.display = 'block';
                break;
            case '图二 各年龄男女睡眠情况折线图':
                LineChartProcessing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelector('.line').style.display = 'block';
                break;
            case '图三 睡眠情况饼状图':
                PieChartProcesing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelector('.pie').style.display = 'block';
                break;
            default:
                console.log('未知方法');
        }
    });
}

function ColumnChartProcessing(filterData) {
    // 统计职业数量
    let OccupationSet = new Set();
    filterData.map((item) => {
        OccupationSet.add(item.Occupation)
    })
    // 计算各职业不同睡眠水平的人数
    let NoneMap = new Map();
    let OtherMap = new Map();
    let TotalMap = new Map();
    OccupationSet.forEach((value) => {
        NoneMap.set(value, 0);
        OtherMap.set(value, 0);
        TotalMap.set(value, 0);
    })
    filterData.forEach(value => {
        if (value["Sleep Disorder"] === "None") {
            NoneMap.set(value["Occupation"], NoneMap.get(value["Occupation"]) + 1);
        } else {
            OtherMap.set(value["Occupation"], OtherMap.get(value["Occupation"]) + 1);
        }
        TotalMap.set(value["Occupation"], TotalMap.get(value["Occupation"]) + 1);
    })

    // 转成数组
    // 各种职业
    let OccupationList = Array.from(NoneMap.keys());
    // 各职业睡眠水平为正常人数
    let NoneList = Array.from(NoneMap.values());
    // 各职业睡眠水平不正常人数
    let OtherList = Array.from(OtherMap.values());
    // 各职业总的人数
    let TotalList = Array.from(TotalMap.values());
    // 画图
    ColumnChart(OccupationList, NoneList, OtherList, TotalList);
}

function ColumnChart(OccupationList, NoneList, OtherList, TotalList) {
    var NoneColor = '#b1ddf0';
    var OtherColor = '#f2cc8f';
    var AcitveColor = '#acb030';
    const svg = d3.select("body")
        .append("svg")
        .attr("class", "column chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        .style("background-color", 'red')
        .attr("transform", "translate(" + margin.left + ",-" + margin.top + ")");

    // 在SVG元素中定义箭头marker
    svg.append("defs").append("marker")
        .attr("id", "arrow-x")        // arrow的ID，用于后续引用
        .attr("viewBox", "0 0 10 10") // 箭头的坐标系统
        .attr("refX", 3)            // 箭头X方向上的参考点
        .attr("refY", 7)            // 箭头Y方向上的参考点
        .attr("markerWidth", 3)     // 箭头的宽度
        .attr("markerHeight", 3)    // 箭头的高度
        .attr("orient", "0") // 箭头的方向根据线条自动调整
        .append("path")             // 设置箭头的形状
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");    // 设置箭头的颜色
    svg.append("defs").append("marker")
        .attr("id", "arrow-y")        // arrow的ID，用于后续引用
        .attr("viewBox", "0 0 10 10") // 箭头的坐标系统
        .attr("refX", 3)            // 箭头X方向上的参考点
        .attr("refY", 3)            // 箭头Y方向上的参考点
        .attr("markerWidth", 3)     // 箭头的宽度
        .attr("markerHeight", 3)    // 箭头的高度
        .attr("orient", "270") // 箭头的方向根据线条自动调整
        .append("path")             // 设置箭头的形状
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");    // 设置箭头的颜色


    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleBand()
        .domain(OccupationList.map((d) => d))
        .range([0, width])
        .padding(0.4);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(TotalList) + 10])
        .range([height, 100]);
    // 创建 x 和 y 轴
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .attr('stroke-width', 2)
        .call(d3.axisBottom(xScale))
        .attr("marker-end", "url(#arrow-x)")
        .selectAll('text')

        .style('fill', '#000')  // 改变文字颜色
        .style('font-size', '14px');
    svg.append("g")
        .attr("class", "axis y-axis")
        .attr('stroke-width', 2)
        .call(d3.axisLeft(yScale))
        .attr("marker-end", "url(#arrow-y)")
        .selectAll('text')
        .style('fill', '#000')  // 改变文字颜色
        .style('font-size', '20px');
    // 显示人数

    svg.selectAll(".axis line").remove();
    // svg.selectAll("rect")
    //     .data(TotalList)
    //     .enter()
    //     .append("text")
    //     .text((d) => d)
    //     .attr("y", (d) => yScale(d) - 5)
    //     .attr("text-anchor", "middle")
    //     .attr("fill", "black")
    //     .attr("font-size", "28px")
    //     .attr('transform', function (d, i) {
    //         return "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth(), 0] + ")";
    //     });
    svg.append("text")
        .attr("class", "title")
        .attr("x", svgWidth / 3)
        .attr("y", svgHeight)
        .text("图一 职业与睡眠水平柱状图")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", -20)
        .attr("y", 80)
        .text("人数")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", svgWidth - margin.left * 5)
        .attr("y", height + margin.top + margin.bottom)
        .text("各种职业")

    // 创建柱子
    svg.selectAll("rect")
        .data(TotalList)
        .enter()
        .append("rect")
        .attr("id", (d, i) => {
            return "rect_" + i;
        })
        .attr("class", "rect")
        .attr("y", (d) => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d))
        .attr("fill", NoneColor)

        .attr('transform', function (d, i) {
            return "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")";
        })
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", AcitveColor)
            // let i = this.id[this.id.length - 1]
            // d3.select(`#${this.id}`).attr("transform", "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 2/5, 0] + ")  scale(1.4,1)")
                .style("cursor", "pointer");
            svg.selectAll(".text")
                .data(TotalList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    if (("rect_" + i) == this.id) {
                        return TotalList[i]-NoneList[i];
                    }
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
        })
        // 鼠标离开事件
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", NoneColor);
            // let i = this.id[this.id.length - 1]
            // d3.select(`#${this.id}`).attr("transform", "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")")
            d3.selectAll('.word').remove();
        });
    ;
    svg.selectAll("rect.overThreshold")
        .data(NoneList)
        .enter()
        .append("rect")
        .attr("id", (d, i) => {
            return "rectOver_" + i;
        })
        .attr("class", "rectOver")
        .attr("y", (d) => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d))
        .attr("fill", OtherColor)
        .attr('transform', function (d, i) {
            return "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")";
        })
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", AcitveColor)
            // let i = this.id[this.id.length - 1]
            // d3.select(`#${this.id}`).attr("transform", "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 2/5, 0] + ")  scale(1.4,1)")
                .style("cursor", "pointer");
            svg.selectAll(".text")
                .data(NoneList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    if (("rectOver_" + i) == this.id) {
                        return d;
                    }
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
        })
        // 鼠标离开事件
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", OtherColor);
           //  let i = this.id[this.id.length - 1];
           // d3.select(`#${this.id}`).attr("transform", "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")");
            d3.selectAll('.word').remove();
        });
    ;

    //图例数组，格式可自定义
    var data_legend = [
        {
            "name": "睡眠不好",
            "color": NoneColor
        },
        {
            "name": "睡眠正常",
            "color": OtherColor
        }
    ];

    var legend = svg.selectAll(".legend")
        .data(data_legend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(-30," + (i * 40 + 50) + ")";
        })
        .on("mouseover", function () {
            svg.selectAll(".text")
                .data(TotalList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    return d;
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
            svg.selectAll(".text")
                .data(NoneList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    return d;
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
        })
        // 鼠标离开事件
        .on("mouseout", function () {
            d3.selectAll('.word').remove();
        });
    ;
    legend.append("rect")
        .attr("x", width - 25)
        .attr("y", 8)
        .attr("width", 40)
        .attr("height", 30)
        .style("fill", function (d) {
            return d.color
        });
    legend.append("text")
        .attr("x", width - 40)
        .attr("y", 28)
        .style("text-anchor", "end") //样式对齐
        .text(function (d) {
            return d.name;
        });

}

function LineChartProcessing(filterData) {
    // 统计年龄范围
    let ageSet = new Set();
    filterData.map((item) => {
        ageSet.add(item.Age)
    })
    // 计算各年龄不同性别睡眠正常的人数
    let MaleMap = new Map();
    let FemaleMap = new Map();
    let TotalMap = new Map();
    ageSet.forEach((value) => {
        MaleMap.set(value, 0);
        FemaleMap.set(value, 0);
        TotalMap.set(value, 0);
    })
    filterData.forEach(value => {
        if (value["Sleep Disorder"] === "None") {
            if (value["Gender"] === "Male") {
                MaleMap.set(value["Age"], MaleMap.get(value["Age"]) + 1);
            } else {
                FemaleMap.set(value["Age"], FemaleMap.get(value["Age"]) + 1);
            }
        }
        TotalMap.set(value["Age"], TotalMap.get(value["Age"]) + 1);
    })
    // 计算各百分比
    // TotalMap.forEach((value, key) =>{
    //     MaleMap.set(key, Math.ceil(MaleMap.get(key)/value)* 100);
    //     FemaleMap.set(key, Math.ceil(FemaleMap.get(key)/value) * 100);
    //     console.log(key+"::::"+MaleMap.get(key)+"::::"+FemaleMap.get(key))
    // })
    // 转成数组
    // 各种年龄
    let AgeList = Array.from(TotalMap.keys());
    // 各职业睡眠水平为正常人数
    let MaleList = Array.from(MaleMap.values());
    // 各职业睡眠水平不正常人数
    let FemaleList = Array.from(FemaleMap.values());
    // 各职业总的人数
    let TotalList = Array.from(TotalMap.values());
    // 去除末尾0
    // while (MaleList[MaleList.length - 1] === 0) {
    //     MaleList.pop();
    // }
    // while (FemaleList[FemaleList.length - 1] === 0) {
    //     FemaleList.pop();
    // }
    // while (TotalList[TotalList.length - 1] === 0) {
    //     TotalList.pop();
    // }
    LineChart(AgeList, MaleList, FemaleList, TotalList);
}

function LineChart(AgeList, MaleList, FemaleList, TotalList) {
    var MaleColor = '#ff0505';
    var FemaleColor = '#3e7cb0';
    var AcitveColor = 'orange';
    const svg = d3.select("body")
        .append("svg")
        .attr("class", "line chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        .attr("transform", "translate(" + margin.left + ",-" + margin.top + ")");

    // 在SVG元素中定义箭头marker
    svg.append("defs").append("marker")
        .attr("id", "arrow-x2")        // arrow的ID，用于后续引用
        .attr("viewBox", "0 0 10 10") // 箭头的坐标系统
        .attr("refX", 3)            // 箭头X方向上的参考点
        .attr("refY", 7)            // 箭头Y方向上的参考点
        .attr("markerWidth", 3)     // 箭头的宽度
        .attr("markerHeight", 3)    // 箭头的高度
        .attr("orient", "0") // 箭头的方向根据线条自动调整
        .append("path")             // 设置箭头的形状
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");    // 设置箭头的颜色
    svg.append("defs").append("marker")
        .attr("id", "arrow-y2")        // arrow的ID，用于后续引用
        .attr("viewBox", "0 0 10 10") // 箭头的坐标系统
        .attr("refX", 3)            // 箭头X方向上的参考点
        .attr("refY", 3)            // 箭头Y方向上的参考点
        .attr("markerWidth", 3)     // 箭头的宽度
        .attr("markerHeight", 3)    // 箭头的高度
        .attr("orient", "270") // 箭头的方向根据线条自动调整
        .append("path")             // 设置箭头的形状
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");    // 设置箭头的颜色

    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleBand()
        .domain(AgeList.map((d) => d))
        .range([0, width])
        .padding(0.4);
    const yScale = d3.scaleLinear()
        .domain([-1, d3.max(TotalList)])
        .range([height, 100]);
    // 创建 x 和 y 轴
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .attr('stroke-width', 2)
        .call(d3.axisBottom(xScale))
        .attr("marker-end", "url(#arrow-x2)")
        .selectAll('text')
        .style('fill', '#000')  // 改变文字颜色
        .style('font-size', '20px');
    svg.append("g")
        .attr("class", "axis y-axis")
        .attr('stroke-width', 2)
        .call(d3.axisLeft(yScale))
        .attr("marker-end", "url(#arrow-y2)")
        .selectAll('text')
        .style('fill', '#000')  // 改变文字颜色
        .style('font-size', '20px');

    var line = d3.line()
        .x(function (d, i) {
            return xScale(AgeList[i]);
        })
        .y(function (d) {
            return yScale(d);
        });
    var line2 = d3.line()
        .x(function (d, i) {
            return xScale(AgeList[i]);
        })
        .y(function (d) {
            return yScale(d)+5;
        });
    svg.append("path")
        .attr("class","male")
        .datum(MaleList)
        .attr("fill", "none")
        .attr("stroke", MaleColor)
        .attr("stroke-width", 12)
        .attr("d", line)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke", AcitveColor);
            console.log("Data: " + MaleList[i]);
            d3.select(`.male`).attr("d",line2).style("cursor","pointer");
            console.log("=============")
            svg.selectAll(".dot")
                .data(MaleList)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 10).style("fill", "red");
            svg.selectAll(".text")
                .data(MaleList)
                .enter().append("text") // 为每个数据点添加 text
                .attr("class", "word")
                .attr("x", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("y", function (d) {
                    return yScale(d);
                })
                .attr("dy", "-1em") // 设置偏移使得文字不会与数据点重叠
                .text(function (d, i) {
                    return d;
                });
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke", MaleColor);
            d3.select(`.male`).attr("d",line);
            d3.selectAll(".word").remove();
            d3.selectAll(".dot").remove();
        });
    svg.append("path")
        .attr("class","female")
        .datum(FemaleList)
        .attr("fill", "none")
        .attr("stroke", FemaleColor)
        .attr("stroke-width", 12)
        .attr("d", line)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke", AcitveColor);
            d3.select(`.female`).attr("d",line2).style("cursor","pointer");
            svg.selectAll(".dot")
                .data(FemaleList)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 10).style("fill", "red");
            svg.selectAll(".text")
                .data(FemaleList)
                .enter().append("text") // 为每个数据点添加 text
                .attr("class", "word")
                .attr("x", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("y", function (d) {
                    return yScale(d);
                })
                .attr("dy", "-1em") // 设置偏移使得文字不会与数据点重叠
                .text(function (d, i) {
                    return d;
                });
            console.log("Data: " + FemaleList[i]);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke", FemaleColor);
            d3.select(`.female`).attr("d",line);
            d3.selectAll(".word").remove();
            d3.selectAll(".dot").remove();
        });


    svg.selectAll(".axis line").remove();
    svg.append("text")
        .attr("class", "title")
        .attr("x", svgWidth / 3)
        .attr("y", svgHeight)
        .text("图二 各年龄男女睡眠情况折线图")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", -20)
        .attr("y", 80)
        .text("人数")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", svgWidth - margin.left * 5)
        .attr("y", height + margin.top + margin.bottom)
        .text("年龄")

    //图例数组，格式可自定义
    var data_legend = [
        {
            "name": "男性",
            "color": MaleColor
        },
        {
            "name": "女性",
            "color": FemaleColor
        }
    ];

    var legend = svg.selectAll(".legend")
        .data(data_legend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(-30," + (i * 30 + 60) + ")";
        })
        .on("mouseover", function (d, i) {
            svg.selectAll(".dot")
                .data(MaleList)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 10).style("fill", "red");
            svg.selectAll(".text")
                .data(MaleList)
                .enter().append("text") // 为每个数据点添加 text
                .attr("class", "word")
                .attr("x", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("y", function (d) {
                    return yScale(d);
                })
                .attr("dy", "-1em") // 设置偏移使得文字不会与数据点重叠
                .text(function (d, i) {
                    return d;
                });
            svg.selectAll(".dot1")
                .data(FemaleList)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 10).style("fill", "red");
            svg.selectAll(".text1")
                .data(FemaleList)
                .enter().append("text") // 为每个数据点添加 text
                .attr("class", "word")
                .attr("x", function (d, i) {
                    return xScale(AgeList[i]);
                })
                .attr("y", function (d) {
                    return yScale(d);
                })
                .attr("dy", "-1em") // 设置偏移使得文字不会与数据点重叠
                .text(function (d, i) {
                    return d;
                });
        })
        .on("mouseout", function (d, i) {
            d3.selectAll(".word").remove();
            d3.selectAll(".dot").remove();
        });
    ;
    legend.append("rect")
        .attr("x", width - 25)
        .attr("y", 8)
        .attr("width", 40)
        .attr("height", 3)
        .style("fill", function (d) {
            return d.color
        });
    legend.append("text")
        .attr("x", width - 40)
        .attr("y", 15)
        .style("text-anchor", "end") //样式对齐
        .text(function (d) {
            return d.name;
        });

}

function PieChartProcesing(filterData) {
    let None = 0;
    let Insomnia = 0;
    let SleepApnea = 0;
    let Total = 0;
    filterData.map((d) => {
        switch (d["Sleep Disorder"]) {
            case "None":
                None += 1;
                break;
            case "Insomnia":
                Insomnia += 1;
                break;
            case "Sleep Apnea":
                SleepApnea += 1;
                break;
        }
        Total += 1;
    })
    None = (None * 100 / Total).toFixed(2)
    Insomnia = (Insomnia * 100 / Total).toFixed(2)
    SleepApnea = (SleepApnea * 100 / Total).toFixed(2)
    console.log(None, Insomnia, SleepApnea, Total);
    PieChart([None, Insomnia, SleepApnea], ["睡眠水平正常", "失眠", "睡眠呼吸暂停"])
}

function PieChart(data, arr) {
    // 假设我们有以下数据
    var radius = Math.min(svgWidth, svgHeight) / 3;
    var color = d3.scaleOrdinal(d3.schemeCategory10); //颜色比例尺

    var svg = d3.select("body").append("svg")
        .attr("class", "pie chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        // .attr("transform", "scale(0.1,0.3)")
        .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

    var pie = d3.pie(); //创建饼图布局

    var arc = d3.arc()  // 创建弧形生成器
        .innerRadius(0)
        .outerRadius(radius);

    var arcs = svg.selectAll("g.arc")
        .data(pie(data))  //使用饼图布局处理数据
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")   // 为每个扇区插入一个路径
        .attr("fill", function (d, i) {
            return color(i);  //颜色用比例尺映射
        })
        .attr("d", arc)
        .on("mouseover", function (d, i) {
            // 在鼠标移入时，放大切片的外半径
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc().innerRadius(0).outerRadius(radius * 1.2));  // outerRadius增大10%

            arcs.append("text")
                .attr("id", "legend_text")
                .attr("transform", function (d) {
                    return "translate(" + [arc.centroid(d)[0], arc.centroid(d)[1] + 20] + ")";
                })
                .attr("dy", ".55em")
                .attr("text-anchor", "middle")
                .attr("fill", "#fff")
                .text(function (d, i) {
                    return data[i] + '%'
                });
        })
        .on("mouseout", function (d, i) {
            // 在鼠标移出时，恢复切片的外半径
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc().innerRadius(0).outerRadius(radius));  // outerRadius恢复原状

            // 在鼠标移出时，移除切片上的文本
            arcs.selectAll("#legend_text").remove();
        });
    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text(function (d, i) {
            return arr[i]
        });

    svg.append("text")
        .attr("class", "title")
        .attr("x", -width / 10)
        .attr("y", height / 2)
        .text("图三 睡眠情况饼状图")

    var data_legend = [
        {
            "name": "睡眠水平正常",
            "color": color(0)
        },
        {
            "name": "失眠",
            "color": color(1)
        },
        {
            "name": "睡眠呼吸暂停",
            "color": color(2)
        }
    ];
    // let data_legend = data.map((key, i) => ({ [key]: color[i] }));
    var legend = svg.selectAll(".legend")
        .data(data_legend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(-30,-" + (i * 40 + 230) + ")";
        })
        .on("mouseover", function (d, i) {
            arcs.append("text")
                .attr("id", "legend_text")
                .attr("transform", function (d) {
                    return "translate(" + [arc.centroid(d)[0], arc.centroid(d)[1] + 20] + ")";
                })
                .attr("dy", ".55em")
                .attr("text-anchor", "middle")
                .attr("fill", "#fff")
                .text(function (d, i) {
                    return data[i] + '%'
                });
        })
        .on("mouseout", function (d, i) {
            arcs.selectAll("#legend_text").remove();
        });
    legend.append("rect")
        .attr("x", width / 2 - 25)
        .attr("y", 8)
        .attr("width", 40)
        .attr("height", 30)
        .style("fill", function (d) {
            return d.color
        });
    legend.append("text")
        .attr("x", width / 2 - 40)
        .attr("y", 25)
        .style("text-anchor", "end") //样式对齐
        .text(function (d) {
            return d.name;
        });

}

function init() {
    var svg = d3.select("body").append("div")
        .attr("class", "root chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        .attr("class", "root1 chart")
        .attr("transform", "translate(10,30)")

    let b = svg.append("g").attr("class", "content")
    b.append("h1").style("top", "20%").text("睡眠健康和生活方式数据集");
    b.append("h2").attr("class", "word").text(`数据来源:https://www.kaggle.com/datasets/uom190346a/sleep-health-and-lifestyle-dataset/data;`);
    b.append("h2").attr("class", "word").text(`睡眠健康和生活方式数据集由 400 行和 13 列组成，涵盖与睡眠和日常习惯相关的广泛变量。它包括性别、年龄、职业、睡眠时长、睡眠质量、体力活动水平、压力水平、BMI类别、血压、心率、每日步数以及是否存在睡眠障碍等详细信息。`);


}