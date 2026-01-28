// dashboard.js
function loadSalesReport(period, startDate = null, endDate = null) {
  let url = `http://localhost:8080/api/reports/sales?period=${period}`;
  if (period === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }

  $.get(url)
    .done(function(data) {
      renderSalesTable(data);
      $.get(`http://localhost:8080/api/reports/sales/summary?period=${period}&startDate=${startDate || ''}&endDate=${endDate || ''}`)
        .done(function(summary) {
          renderSummaryCards(summary);
        })
        .fail(function() {
          alert('Failed to load summary data.');
        });
    })
    .fail(function(xhr, status, error) {
      alert(`Failed to load sales data. Status: ${xhr.status} ${error}`);
      console.error('AJAX Error:', xhr.responseText);
    });
}

function renderSalesTable(data) {
  const tbody = $('#salesTableBody');
  if (data.length === 0) {
    tbody.html('<tr><td colspan="5" class="text-center">No sales data</td></tr>');
    return;
  }

  let rows = '';
  data.forEach(item => {
    rows += `
      <tr>
        <td>${item.date}</td>
        <td>Nu.${parseFloat(item.totalSales).toFixed(2)}</td>
        <td>${item.totalOrders}</td>
        <td>Nu.${parseFloat(item.totalTax).toFixed(2)}</td>
        <td>Nu.${parseFloat(item.totalDiscount).toFixed(2)}</td>
      </tr>
    `;
  });
  tbody.html(rows);
}

function renderSummaryCards(summary) {
  const cards = `
    <div class="col-md-3">
      <div class="card bg-primary text-white">
        <div class="card-body">
          <h5>Total Sales</h5>
          <h4>Nu.${summary.totalSales.toFixed(2)}</h4>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-success text-white">
        <div class="card-body">
          <h5>Orders</h5>
          <h4>${summary.totalOrders}</h4>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-warning text-dark">
        <div class="card-body">
          <h5>Tax Collected</h5>
          <h4>Nu.${summary.totalTax.toFixed(2)}</h4>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-info text-white">
        <div class="card-body">
          <h5>Discount Given</h5>
          <h4>Nu.${summary.totalDiscount.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  `;
  $('#summaryCards').html(cards);
}

// Event Listeners
$(document).ready(function() {
  // Load today's report by default
  loadSalesReport('today');

  $('#periodFilter').change(function() {
    const period = $(this).val();
    if (period === 'custom') {
      $('#startDateDiv, #endDateDiv').removeClass('d-none');
      $('#startDate').val('');
      $('#endDate').val('');
    } else {
      $('#startDateDiv, #endDateDiv').addClass('d-none');
      loadSalesReport(period);
    }
  });

  $('#applyFilter').click(function() {
    const period = $('#periodFilter').val();
    if (period === 'custom') {
        const start = $('#startDate').val();
        const end = $('#endDate').val();
        if (!start || !end) {
            alert('Please select both start and end dates.');
            return;
        }
        if (new Date(start) > new Date(end)) {
            alert('Start date cannot be after end date.');
            return;
        }
        loadSalesReport('custom', start, end);
    } else {
        loadSalesReport(period);
    }
});
});