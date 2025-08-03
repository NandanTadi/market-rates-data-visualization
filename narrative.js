
let sceneIndex = 0;

d3.csv("rates_annual.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d.FEDFUNDS = +d.FEDFUNDS;
    d.GS2 = +d.GS2;
    d.GS10 = +d.GS10;
    d.GS30 = +d.GS30;
  });

  renderScene();

  d3.select("#next").on("click", () => {
    sceneIndex = Math.min(sceneIndex + 1, 3);
    renderScene();
  });

  d3.select("#back").on("click", () => {
    sceneIndex = Math.max(sceneIndex - 1, 0);
    renderScene();
  });

  function renderScene() {
    d3.select("#chart").html("");
    d3.select("#annotation").html("");

    if (sceneIndex === 0) drawScene1(data);
    if (sceneIndex === 1) drawScene2(data);
    if (sceneIndex === 2) drawScene3(data);
    if (sceneIndex === 3) drawScene4(data);
  }

  function drawScene1(data) {
    const width = 700, height = 400, margin = {top: 40, right: 40, bottom: 50, left: 60};
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.FEDFUNDS)]).nice().range([height - margin.bottom, margin.top]);
    const line = d3.line().x(d => x(d.Year)).y(d => y(d.FEDFUNDS));
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 2).attr("d", line);
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")))
       .append("text").attr("x", width / 2).attr("y", 35).attr("fill", "#000").text("Year");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y))
       .append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -40)
       .attr("fill", "#000").attr("text-anchor", "middle").text("Fed Funds Rate (%)");
    d3.select("#annotation").text("Scene 1: Fed Funds Rate rose sharply after 2021.");
  }

  function drawScene2(data) {
    const width = 700, height = 400, margin = {top: 40, right: 100, bottom: 50, left: 60};
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => Math.max(d.GS2, d.GS10, d.GS30))]).nice().range([height - margin.bottom, margin.top]);
    const line = key => d3.line().x(d => x(d.Year)).y(d => y(d[key]));

    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "red").attr("stroke-width", 2).attr("d", line("GS2"));
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "green").attr("stroke-width", 2).attr("d", line("GS10"));
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "blue").attr("stroke-width", 2).attr("d", line("GS30"));

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format("d")))
       .append("text").attr("x", width / 2).attr("y", 35).attr("fill", "#000").text("Year");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y))
       .append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -40)
       .attr("fill", "#000").attr("text-anchor", "middle").text("Yield (%)");

    const legend = svg.append("g").attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
    const labels = ["2Y", "10Y", "30Y"];
    const colors = ["red", "green", "blue"];
    labels.forEach((label, i) => {
      legend.append("circle").attr("cx", 0).attr("cy", i * 20).attr("r", 5).attr("fill", colors[i]);
      legend.append("text").attr("x", 10).attr("y", i * 20 + 4).text(label).attr("font-size", "12px");
    });

    d3.select("#annotation").text("Scene 2: Yield curve inverted as 2Y rose above 10Y after 2022.");
  }

  function drawScene3(data) {
    const bonds = [
      {bond: "Short Treasury", duration: 2, price_2020: 100, price_2023: 96},
      {bond: "Long Treasury", duration: 30, price_2020: 100, price_2023: 78},
      {bond: "Corporate BBB", duration: 10, price_2020: 100, price_2023: 85}
    ];
    bonds.forEach(d => d.loss = 100 * (1 - d.price_2023 / d.price_2020));
    const width = 700, height = 400, margin = {top: 40, right: 40, bottom: 40, left: 60};
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    const x = d3.scaleBand().domain(bonds.map(d => d.bond)).range([margin.left, width - margin.right]).padding(0.4);
    const y = d3.scaleLinear().domain([0, d3.max(bonds, d => d.loss)]).nice().range([height - margin.bottom, margin.top]);
    svg.selectAll("rect").data(bonds).enter().append("rect")
      .attr("x", d => x(d.bond)).attr("y", d => y(d.loss)).attr("width", x.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.loss)).attr("fill", "tomato");
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))
       .append("text").attr("x", width / 2).attr("y", 35).attr("fill", "#000").text("Bond Type");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y))
       .append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -40)
       .attr("fill", "#000").attr("text-anchor", "middle").text("Loss (%)");
    d3.select("#annotation").text("Scene 3: Long-duration bonds lost the most value during rate hikes.");
  }

function drawScene4(data) {
  const bonds = [
    { bond: "Short Treasury", duration: 2, yield: 4.5 },
    { bond: "Long Treasury", duration: 30, yield: 5.2 },
    { bond: "Corporate BBB", duration: 10, yield: 6.1 }
  ];

  const width = 700, height = 400;
  const margin = { top: 40, right: 40, bottom: 50, left: 60 };

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain([0, d3.max(bonds, d => d.duration)])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bonds, d => d.yield)])
    .range([height - margin.bottom, margin.top]);

  svg.selectAll("circle")
    .data(bonds)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.duration))
    .attr("cy", d => y(d.yield))
    .attr("r", 8)
    .attr("fill", "steelblue")
    .style("cursor", "pointer")
    .on("click", function (e, d) {
      d3.select("#annotation")
        .text(`${d.bond}: ${d.duration} years, ${d.yield}% yield`);
    });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 35)
    .attr("fill", "#000")
    .text("Duration (Years)");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .text("Yield (%)");

  d3.select("#annotation")
    .text("Scene 4: Click on each dot to see details.");
}

});
