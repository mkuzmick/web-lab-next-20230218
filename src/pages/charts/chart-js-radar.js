import React from 'react';
var Airtable = require('airtable');

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const findMany = async ({ baseId, table, view, max }) => {
    var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(baseId);
    console.log(`looking in airtable`)
    var theRecords = [];
    await base(table).select({
        maxRecords: max ? max : 100,
        view: view ? view : "Grid view"
    }).eachPage(function page(records, next){
        theRecords.push(...records);
        next()
      })
      .catch(err=>{console.error(err); return})
    return theRecords;
}

export default function GameControllerChart(props) {
    console.log("working with props.data")
    console.log(props.data)
    const data = {
        labels: ['Responsiveness', 'Ease of Use', 'Coolness', 'Affordability', 'Durability'],
        datasets: props.data.map(e=>{
            return {
                label: e.fields.Name,
                data: [e.fields.ResponsivenessAverage, e.fields.EaseOfUseAverage, e.fields.CoolnessAverage, e.fields.AffordabilityAverage, e.fields.DurabilityAverage],
                backgroundColor: e.fields.Color,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }
        })
    };
    const options = {
    
        scales: {
            r: {
                angleLines: {
                    display: false
                },
                min: 0,
                // max: 20
            }
        }
    
    }
    return (
        <div style={{ maxWidth: "70%", maxHeight: "80vh" }}>
            <Radar data={data} options={options} />
        </div>
    )
}

export async function getServerSideProps() {
    var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_WEBLAB_BASE);
    const airtableResult = await findMany({baseId: process.env.AIRTABLE_WEBLAB_BASE, table: "Controllers", view: "MAIN", max: 5});
    return { props: {data: JSON.parse(JSON.stringify(airtableResult))} }
}