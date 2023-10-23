import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

let spaceX
let svg
let projection

function setup(){
    spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        renderLaunches(data, listContainer);
        drawMap();
        listContainer.addEventListener("mouseover", PointChange)
    })
}
function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function drawMap(){
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    let lpads = spaceX.launchpads()
    lpads.then(lp => {

        lp.forEach(ll => {
            let lat = ll.latitude
            let long = ll.longitude
            let coord = projection([long,lat])
            svg.append("circle")
            .attr("cx", coord[0])
            .attr("cy", coord[1])
            .attr("r", 5)
            .style("fill", 'blue')
            .style("stroke", 'blue')
;
        })


    })


    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            return 'green';
        })
        .style("opacity", .7)
}

function PointChange() {
    let elements = document.querySelectorAll('#listContainer li')
    elements.forEach(m => {
        m.addEventListener("mouseover", ChColor)
        m.addEventListener("mouseout", BaseColor)
    })
    listContainer.removeEventListener("mouseover", PointChange)
}

function ChColor(Event) {
    let Elem = Event.target
    Elem.style.backgroundColor = 'orange';
    let text = Elem["innerText"]
    ChangePointColor(text, 'orange', 5)
}

function BaseColor(Event) {
    let Elem = Event.target
    Elem.style.backgroundColor = 'white';
    let text = Elem["innerText"]
    ChangePointColor(text, 'blue', 5)
}

function ChangePointColor(r_name, color, rad) {
    let lpads = spaceX.launchpads()

    spaceX.launches().then(launch => {
        launch.forEach(l => {
            if (l.name === r_name) {
                let lpadUID = l.launchpad
                lpads.then(lp => {
                    lp.forEach(ll => {
                        if (ll.id === lpadUID) {
                            let lat = ll.latitude
                            let long = ll.longitude
                            let coord = projection([long, lat])
                            svg.append("circle")
                                .attr("cx", coord[0])
                                .attr("cy", coord[1])
                                .attr("r", rad)
                                .style("fill", color)
                                .style("stroke", color);
                        }
                    })
                })
            }
        })
    })

}
