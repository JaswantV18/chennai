const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const metricSelect = `          <div className="relative mt-3">
            <label className="text-[10px] uppercase text-[#71717A] absolute -top-4 left-0">Global View Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as SelectedMetric)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-sm rounded px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="aqi">Air Quality Index (AQI)</option>
              <option value="temp">Ambient Temperature</option>
              <option value="humidity">Relative Humidity</option>
              <option value="rainfall">Precipitation Index</option>
              <option value="vehicles">Active Vehicle Count</option>
              <option value="population">Total Population</option>
              <option value="density">Population Density (/km2)</option>
            </select>
          </div>`;

const timeOfDaySelect = `
          <div className="relative mt-3">
            <label className="text-[10px] uppercase text-[#71717A] absolute -top-4 left-0">Time of Day (Sim)</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-sm rounded px-3 py-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>
`;

content = content.replace(metricSelect, metricSelect + timeOfDaySelect);

fs.writeFileSync('src/App.tsx', content);
