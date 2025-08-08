<template>
  <div class="dashboard-container animate__animated animate__fadeIn">
    <h1 class="dashboard-title">👋 Welcome back, Smart Parker!</h1>

    <section class="dashboard-section animate__animated animate__fadeInUp">
      <div class="section-header">
        <i class="fas fa-chart-line section-icon"></i>
        <h2>Melbourne CBD Population Growth</h2>
      </div>

      <div class="chart-wrap">
        <canvas ref="populationCanvas" class="chart-canvas"></canvas>
      </div>
    </section>

    <section class="dashboard-section animate__animated animate__fadeInUp">
      <div class="section-header">
        <i class="fas fa-info-circle section-icon"></i>
        <h2>Quick City Insights</h2>
      </div>

      <div class="card-grid">
        <div class="card">
          <i class="fas fa-car card-icon"></i>
          <div class="card-content">
            <p class="card-title">Avg Time Spent Searching</p>
            <p class="card-value">17 hrs/year</p>
          </div>
        </div>

        <div class="card">
          <i class="fas fa-road card-icon"></i>
          <div class="card-content">
            <p class="card-title">Most Congested Street</p>
            <p class="card-value">Swanston St</p>
          </div>
        </div>

        <div class="card">
          <i class="fas fa-globe card-icon"></i>
          <div class="card-content">
            <p class="card-title">Population Impact</p>
            <p class="card-value">↑ 38% in 10 years</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "DashboardView",
  data() {
    return { chart: null };
  },
  mounted() {
    this.renderPopulationChart();
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy();
  },
  methods: {
    async renderPopulationChart() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/population/trend",
          {
            params: { region: "Victoria" },
          }
        );

        const trend = res.data?.trend || [];
        if (!trend.length) return;

        const last = trend.slice(-10);
        const labels = last.map((d) => d.year);
        const data = last.map((d) => d.population);

        if (this.chart) this.chart.destroy();

        const ctx = this.$refs.populationCanvas.getContext("2d");
        this.chart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Population (Victoria)",
                data,
                borderColor: "#007bff",
                backgroundColor: "rgba(0,123,255,0.2)",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 200,

            animation: { duration: 300 },

            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => new Intl.NumberFormat().format(ctx.parsed.y),
                },
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: (v) => new Intl.NumberFormat().format(v),
                },
              },
            },
          },
        });
      } catch (err) {
        console.error(
          "Error loading population chart:",
          err?.response?.data || err.message
        );
      }
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 100px auto 60px;
  padding: 0 24px;
}

.dashboard-title {
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: #1f2937;
}

.dashboard-section {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 20px;
  color: #007bff;
  margin-right: 10px;
}

.chart-wrap {
  width: 100%;
  height: 360px;
  position: relative;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.card {
  flex: 1;
  min-width: 240px;
  background-color: #f0f9ff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}
.card:hover {
  transform: scale(1.03);
}

.card-icon {
  font-size: 28px;
  color: #1d4ed8;
  margin-right: 16px;
}

.card-content {
  flex-grow: 1;
}

.card-title {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
}

.card-value {
  font-size: 18px;
  font-weight: bold;
  color: #111;
}

@media (max-width: 768px) {
  .card-grid {
    flex-direction: column;
  }
}
</style>
