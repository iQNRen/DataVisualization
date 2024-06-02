const svgWidth = window.innerWidth * 0.70;
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
            const trimmedKey = key.trim();
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


    return data;
}

function filtering(data) {
    let sampleRate = 0.8;
    let samples = data.filter(() => Math.random() < sampleRate);
    console.log(samples)

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

    let div = d3.select("body")
        .append("div")
        .attr("class", "intro")
        .style("margin-right", "20px")

    let intro1 = div.append("div").attr("class", "columnIntro introduce").style("display", "none");
    let intro2 = div.append("div").attr("class", "lineIntro introduce").style("display", "none");
    let intro3 = div.append("div").attr("class", "pieIntro introduce").style("display", "none");

    intro1.append('h1').text('职业与睡眠水平柱状图');
    intro1.append('h3').text('根据数据集内的Occupation字段，对各职业的各睡眠水平（即Sleep Disorder字段）进行统计，因为Sleep Disorder字段取值有None（正常）, Insomnia（失眠）, Sleep Apnea（睡眠呼吸暂停）等，为方便可视化，提高效率。把Insomnia和Sleep Apnea两个结果统计为Other情况。即最后只需展示None和Other。')
    intro1.append('h3').text('在这个柱状图中，每一个矩阵都用来显示对应的睡眠人数，它包含两种不同的颜色区域。可以根据整个矩形（总人数）减去下面矩形（睡眠正常）快速算出上面矩形（即睡眠不正常的人数）。')
    intro1.append('h3').text('通过这个职业与睡眠水平柱状图可以清晰地展现各职业类别之间的睡眠水平差别和对比关系。')

    intro2.append('h1').text('各年龄男女睡眠情况折线图');
    intro2.append('h3').text('根据数据集各年龄（即age字段），计算每个年龄阶段，各性别的睡眠正常（即Sleep Disorder字段为None）的人数占该年龄阶段、该性别总人数。其中,每个年龄阶段、每个性别人群的总人数等于SleepDisorder字段取值为None、Insomnia或SleepApnea的人数之和。计算方法为当前年龄不同性别的Sleep Disorder字段取值为None的人数/该年龄该性别总人数。')
    intro2.append('h3').text('在这个折线图中，每一个拐点都用来显示对应不同性别的睡眠正常的人数。')
    intro2.append('h3').text('通过这个各年龄男女睡眠情况折线图可以清楚地展示出人们随着各年龄随年龄的睡眠水平变化趋势。也可以明显地对比男女的睡眠水平差异。')

    intro3.append('h1').text('睡眠情况饼状图')
    intro3.append('h3').text('根据数据集中的Sleep Disorder字段，计算出各种睡眠质量（None、Insomnia、Sleep Apnea）的人数所占总人数的比例。请注意，"Sleep Disorder" 字段的值包括 "None"、"Insomnia" 和 "Sleep Apnea" 对应的人数总和即为数据集的总人数。计算比例的方法是具有当前睡眠质量的人数除以总人数。')
    intro3.append('h3').text('在这个饼图中，每一块区域都用来显示对应睡眠水平的百分比。')
    intro3.append('h3').text('通过这个睡眠情况饼状图饼图可以清晰地展示每个睡眠水平在总数中的占比，让人一目了然地看出各个睡眠水平比重的大小。')

    selectElement.addEventListener('click', function () {
        console.log('You selected: ', this.value);
        const selectedValue = this.value;
        switch (selectedValue) {
            case '图一 职业与睡眠水平柱状图':
                ColumnChartProcessing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelectorAll('.introduce').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelector('.column').style.display = 'block';
                document.querySelector('.columnIntro').style.display = 'block';
                break;
            case '图二 各年龄男女睡眠情况折线图':
                LineChartProcessing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelectorAll('.introduce').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelector('.line').style.display = 'block';
                document.querySelector('.lineIntro').style.display = 'block';
                break;
            case '图三 睡眠情况饼状图':
                PieChartProcesing(filterData);
                document.querySelectorAll('.chart').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelectorAll('.introduce').forEach(d => {
                    d.style.display = 'none';
                });
                document.querySelector('.pie').style.display = 'block';
                document.querySelector('.pieIntro').style.display = 'block';
                break;
            default:
                console.log('未知方法');
        }
    });
}

function ColumnChartProcessing(filterData) {
    let OccupationSet = new Set();
    filterData.map((item) => {
        OccupationSet.add(item.Occupation)
    })
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
    let OccupationList = Array.from(NoneMap.keys());
    let NoneList = Array.from(NoneMap.values());
    let OtherList = Array.from(OtherMap.values());
    let TotalList = Array.from(TotalMap.values());
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

    svg.append("defs").append("marker")
        .attr("id", "arrow-x")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 3)
        .attr("refY", 7)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "0")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");
    svg.append("defs").append("marker")
        .attr("id", "arrow-y")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 3)
        .attr("refY", 3)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "270")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");


    let high = height;
    const xScale = d3.scaleBand()
        .domain(OccupationList.map((d) => d))
        .range([0, width])
        .padding(0.4);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(TotalList) + 10])
        .range([high, 100]);
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + high + ")")
        .attr('stroke-width', 12)
        .call(d3.axisBottom(xScale))
        .attr("marker-end", "url(#arrow-x)")
        .selectAll('text')
        .style('fill', '#000')
        .style('font-size', '14px')
        .style("text-anchor", "end")
        .attr("dx", "4.2em")
        .attr("dy", "3.4em")
        // .attr("transform", "rotate(-45)");
    // // .style('transform-origin','bottom')
.
    style('transform', 'rotate(25deg)')
    // .attr("padding", "100px");

    svg.append("g")
        .attr("class", "axis y-axis")
        .attr('stroke-width', 12)
        .call(d3.axisLeft(yScale))
        .attr("marker-end", "url(#arrow-y)")
        .selectAll('text')
        .style('fill', '#000')
        .style('font-size', '20px');

    svg.selectAll(".axis line").remove();
    // svg.append("text")
    //     .attr("class", "title")
    //     .attr("x", svgWidth / 3)
    //     .attr("y", svgHeight)
    //     .text("图一 职业与睡眠水平柱状图")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", -20)
        .attr("y", 80)
        .text("人数")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", svgWidth - margin.left * 2.7)
        .attr("y", height + margin.top - margin.bottom*2)
        .text("职业")

    svg.selectAll("rect")
        .data(TotalList)
        .enter()
        .append("rect")
        .attr("id", (d, i) => {
            return "rect_" + i;
        })
        .attr("class", "rect")
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", AcitveColor)
                .style("cursor", "pointer");
            svg.selectAll(".text")
                .data(TotalList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    if (("rect_" + i) == this.id) {
                        return TotalList[i] - NoneList[i];
                    }
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", NoneColor);
            d3.selectAll('.word').remove();
        })
        .attr("y", height)
        .attr("height", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(800)
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d))
        .attr("fill", NoneColor)
        .attr('transform', function (d, i) {
            return "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")";
        });
    svg.selectAll("rect.overThreshold")
        .data(NoneList)
        .enter()
        .append("rect")
        .attr("id", (d, i) => {
            return "rectOver_" + i;
        })
        .attr("class", "rectOver")
        .on("mouseover", function () {
            d3.select(this)
                .attr("fill", AcitveColor)
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
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", OtherColor);
            d3.selectAll('.word').remove();
        })
        .attr("y", height)
        .attr("height", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(800)
        .attr("y", (d) => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d))
        .attr("fill", OtherColor)
        .attr('transform', function (d, i) {
            return "translate(" + [(xScale.bandwidth() * 5 / 3) * i + xScale.bandwidth() * 3 / 5, 0] + ")";
        });


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
        .style("text-anchor", "end")
        .text(function (d) {
            return d.name;
        });

}

function LineChartProcessing(filterData) {
    let ageSet = new Set();
    filterData.map((item) => {
        ageSet.add(item.Age)
    })
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
    let AgeList = Array.from(TotalMap.keys());
    let MaleList = Array.from(MaleMap.values());
    let FemaleList = Array.from(FemaleMap.values());
    let TotalList = Array.from(TotalMap.values());
    LineChart(AgeList, MaleList, FemaleList, TotalList);
}

function LineChart(AgeList, MaleList, FemaleList, TotalList) {
    var MaleColor = '#779649';
    var FemaleColor = '#bba1cb';
    var AcitveColor = 'orange';
    const svg = d3.select("body")
        .append("svg")
        .attr("class", "line chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        .attr("transform", "translate(" + margin.left + ",-" + margin.top + ")");

    svg.append("defs").append("marker")
        .attr("id", "arrow-x2")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 3)
        .attr("refY", 7)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "0")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");
    svg.append("defs").append("marker")
        .attr("id", "arrow-y2")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 3)
        .attr("refY", 3)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "270")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#555");

    const xScale = d3.scaleBand()
        .domain(AgeList.map((d) => d))
        .range([0, width])
        .padding(0.4);
    const yScale = d3.scaleLinear()
        .domain([-1, d3.max([d3.max(MaleList), d3.max(FemaleList)]) + 1])
        .range([height, 100]);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .attr('stroke-width', 12)
        .call(d3.axisBottom(xScale))
        .attr("marker-end", "url(#arrow-x2)")
        .selectAll('text')
        .style('fill', '#000')
        .style('font-size', '20px');
    svg.append("g")
        .attr("class", "axis y-axis")
        .attr('stroke-width', 12)
        .call(d3.axisLeft(yScale))
        .attr("marker-end", "url(#arrow-y2)")
        .selectAll('text')
        .style('fill', '#000')
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
            return yScale(d) + 5;
        });
    svg.append("path")
        .attr("class", "male")
        .datum(MaleList)
        .attr("fill", "none")
        .attr("stroke", MaleColor)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke-width", 16)
            // .attr("stroke", AcitveColor);
            d3.select(`.male`).attr("d", line2).style("cursor", "pointer");
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke", MaleColor).attr("stroke-width", 6);
            d3.select(`.male`).attr("d", line);
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 6)
        .attr("d", line)
        .attr("stroke-dasharray", function () {
            return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
            return this.getTotalLength();
        })
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    svg.append("path")
        .attr("class", "female")
        .datum(FemaleList)
        .attr("fill", "none")
        .attr("stroke", FemaleColor)
        .attr("stroke-width", 6)
        .attr("d", line)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke-width", 16)
            // .attr("stroke", AcitveColor);
            d3.select(`.female`).attr("d", line2).style("cursor", "pointer");
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke", FemaleColor).attr("stroke-width", 6);
            d3.select(`.female`).attr("d", line);
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", function () {
            return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
            return this.getTotalLength();
        })
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    svg.selectAll(".dot")
        .data(MaleList)
        .enter().append("circle")
        .attr("id", (d, i) => {
            return "dot_" + i;
        })
        .attr("class", "dot")
        .on("mouseover", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 18);
            svg.selectAll(".text")
                .data(MaleList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    if (("dot_" + i) == this.id) {
                        return d;
                    }
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
                .style('color',MaleColor)
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 12);
            d3.selectAll('.word').remove();
        })
        .attr("cx", function (d, i) {
            return xScale(AgeList[i]);
        })
        .attr("cy", function (d) {
            return yScale(d);
        })
        .attr("r", 0).style("fill", MaleColor)
        .transition()
        .duration(500)
        .delay(function (d, i) {
            return i * 80;
        })
        .attr("r", 12);
    svg.selectAll(".dot1")
        .data(FemaleList)
        .enter().append("circle")
        .attr("id", (d, i) => {
            return "dot1_" + i;
        })
        .attr("class", "dot")
        .on("mouseover", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 18)
                .attr("fill", "blue");
            svg.selectAll(".text")
                .data(FemaleList)
                .enter()
                .append("text")
                .attr("class", "word")
                .text((d, i) => {
                    if (("dot1_" + i) == this.id) {
                        return d;
                    }
                })
                .attr("x", (d, i) => (xScale.bandwidth()) * 1.68 * i + xScale.bandwidth())
                .attr("y", (d) => yScale(d) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "28px")
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 12)
                .attr("fill", "red");
            d3.selectAll('.word').remove();
        })
        .attr("cx", function (d, i) {
            return xScale(AgeList[i]);
        })
        .attr("cy", function (d) {
            return yScale(d);
        })
        .attr("r", 0).style("fill", FemaleColor)
        .transition()
        .duration(500)
        .delay(function (d, i) {
            return i * 80;
        })
        .attr("r", 12);

    svg.selectAll(".axis line").remove();
    // svg.append("text")
    //     .attr("class", "title")
    //     .attr("x", svgWidth / 3)
    //     .attr("y", svgHeight)
    //     .text("图二 各年龄男女睡眠情况折线图")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", -20)
        .attr("y", 80)
        .text("人数")
    svg.append("text")
        .attr("class", "shaft")
        .attr("x", svgWidth - margin.left * 3)
        .attr("y", height + margin.top + margin.bottom)
        .text("年龄")

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
        });
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
        .style("text-anchor", "end")
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
    var radius = Math.min(svgWidth, svgHeight) / 3;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select("body").append("svg")
        .attr("class", "pie chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("transform", "translate(0,30)")
        .append("g")
        .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

    var pie = d3.pie();

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var arcs = svg.selectAll("g.arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", arc)
        .on("mouseover", function (d, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc().innerRadius(0).outerRadius(radius * 1.2));

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
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc().innerRadius(0).outerRadius(radius));

            arcs.selectAll("#legend_text").remove();
        })
        .transition()   // 在此处开始一个简单的动画
        .delay(function (d, i) {
            return i * 600;
        }) // 这里是动画延迟
        .duration(600)
        .attrTween('d', function (d) {
            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
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

    // svg.append("text")
    //     .attr("class", "title")
    //     .attr("x", -width / 10)
    //     .attr("y", height / 2)
    //     .text("图三 睡眠情况饼状图")

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
        .style("text-anchor", "end")
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