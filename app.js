let total_pages = 1;
let current_page = 1;
let dataTable, sliderValue, gpuType, cloudGpuTypes, selectedCloud, selectedGpu;


// hide all options at start
$('#loading-overlay, #gpu_options, #gpu_prices_limit, #rate_card, #select_cloud, #select_gpu_details, #input_cloud_creds').hide();

// Function to show the loading indicator
function showLoading() {
    $('#loading-overlay').show();
}

// Function to hide the loading overlay
function hideLoading() {
    $('#loading-overlay').hide();
}

// Function to populate the table with data
function populateTable(data, currentPage, totalPages) {
    const tableHeaders = $('#table-headers');
    const tableBody = $('#table-body');

    // Clear existing table headers and body
    tableHeaders.empty();
    tableBody.empty();

    // Get the keys from the first object to create table headers
    if (data.length > 0) {
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            tableHeaders.append(`<th>${key}</th>`);
        });

        // Populate table body with data
        data.forEach(row => {
            const tableRow = $('<tr></tr>');
            keys.forEach(key => {
                tableRow.append(`<td>${row[key]}</td>`);
            });
            tableBody.append(tableRow);
        });

        // Initialize or reinitialize DataTable
        if ($.fn.DataTable.isDataTable('#data-table')) {
            dataTable.clear().rows.add(data).draw();
        } else {
            dataTable = $('#data-table').DataTable({
                paging: false, // Disable default paging
                searching: false, // Disable searching
                info: false, // Disable info
                columns: keys.map(key => ({ data: key })) // Define columns based on keys
            });
        }
    }

    // Update pagination controls
    updatePaginationControls(currentPage, totalPages);
}

function updatePaginationControls(currentPage, totalPages) {
    $('#page-info').text(`Page ${currentPage} of ${totalPages}`);
    $('#prev-page').prop('disabled', currentPage === 1);
    $('#next-page').prop('disabled', currentPage === totalPages);
}

// Function to populate dropdown options
function populateDropdown(query, options) {
    const dropdown = $(query);
    dropdown.empty();
    options.forEach(option => {
        dropdown.append(`<option value="${option}">${option}</option>`);
    });
}

// Function to fetch GPU rates
function fetchGpuRates(gpuType, sliderValue, page_number) {
    showLoading();

    $.ajax({
        url: `https://us-central1-demokratik-ai.cloudfunctions.net/get_gpu_rates?gpu_type=${gpuType}&cost_limit=${sliderValue}&page_number=${page_number}`, // API endpoint
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // console.log(data);
            $('#rate_card').show();

            current_page = data.current_page;
            total_pages = data.total_pages;

            populateTable(data.gpu_rates, current_page, total_pages);

            $('#select_cloud, #select_gpu_details').show();

            hideLoading();
        },
        error: function (xhr, status, error) {
            console.error(error);
            hideLoading();
        }
    });
}

// Function to rotate the needle on the speedometer
function setSpeed(speed, needle, priceDisplay) {
    const minRotation = 180; // Minimum rotation in degrees
    const maxRotation = 360; // Maximum rotation in degrees
    const rotation = minRotation + (speed / 50) * (maxRotation - minRotation);
    needle.css("transform", `rotate(${rotation}deg)`);
    priceDisplay.attr('data-price', speed);
    priceDisplay.text(`Price: $${speed.toFixed(2)}`);
}

// Slider for GPU prices
$('.slider').on('input', function () {
    const value = parseFloat($(this).val());
    const container = $(this).closest('.gpu-container');
    const needle = container.find('.needle');
    const priceDisplay = container.find('.price-display');
    const priceSpan = container.find('#price');

    setSpeed(value, needle, priceDisplay);
    priceSpan.text(value.toFixed(2));
});

// Dropdown change event
$('.dropdown-select').change(function () {
    const selectedId = $(this).attr('id');
    const selectedOption = $(this).val();
    const selectedText = $(this).find('option:selected').text();
    // console.log('Selected Option ID:', selectedId);
    // console.log('Selected Option Value:', selectedOption);
    // console.log('Selected Option Text:', selectedText);
    $('#message-container1').empty();  // Clear the message when any option is selected
    $('#message-container2').empty();
    switch (selectedId) {
        case 'dropdown1':
            if (selectedOption == "Are you looking for a GPU") $('#gpu_options').show();
            else if (selectedOption == "Do you have an LLM in mind") {
                $('#message-container1').text("We are still working on this and plan to release it soon. Stay tuned. Gracias 🙏");
                $('#gpu_options, #gpu_prices_limit, #rate_card, #select_cloud, #select_gpu_details, #input_cloud_creds').hide();
                window.parent.postMessage({ type: 'scrollToEmail' }, "*");
            } else $('#gpu_options, #gpu_prices_limit, #rate_card, #select_cloud, #select_gpu_details, #input_cloud_creds').hide();
            break;
        case 'dropdown2':
            if (selectedOption == "Do you want to view rate card across 20 GPU clouds") $('#gpu_prices_limit').show();
            else if (selectedOption == "Do you have an LLM task in mind") {
                $('#message-container2').text("We are still working on this and plan to release it soon. Stay tuned. Gracias 🙏");
                $('#gpu_prices_limit, #rate_card, #select_cloud, #select_gpu_details, #input_cloud_creds').hide();
                window.parent.postMessage({ type: 'scrollToEmail' }, "*");
            } else $('#gpu_prices_limit, #rate_card, #select_cloud, #select_gpu_details, #input_cloud_creds').hide();
            break;
        case 'dropdown3':
            selectedCloud = $('#dropdown3').val();
            populateDropdown('#dropdown4', Object.keys(cloudGpuTypes[selectedCloud]));
            selectedGpu = $('#dropdown4').val();
            populateDropdown('#dropdown5', cloudGpuTypes[selectedCloud][selectedGpu]);
        case 'dropdown4':
            selectedGpu = $('#dropdown4').val();
            populateDropdown('#dropdown5', cloudGpuTypes[selectedCloud][selectedGpu]);
        default:
            break;
    }
});

// Event listeners for pagination controls
$('#prev-page').click(function () {
    if (current_page > 1) {
        current_page--;
        fetchGpuRates(gpuType, sliderValue, current_page);
    }
});

$('#next-page').click(function () {
    if (current_page < total_pages) {
        current_page++;
        fetchGpuRates(gpuType, sliderValue, current_page);
    }
});

$('#confirm').click(function () {
    window.parent.postMessage({ type: 'scrollToEmail' }, "*");
    // const selectedCloud = $('#dropdown3').val();
    // const selectedGpu = $('#dropdown4').val();
    // const selectedGpuType = $('#dropdown5').val();

    // // console.log(selectedCloud, selectedGpu, selectedGpuType);

    // $('#input_cloud_creds').show();

    // switch (selectedCloud) {
    //     case 'AWS':
    //         $('#AWS').show();
    //         break;
    //     default:
    //         $('#input_cloud_creds').hide();
    //         break;
    // }
    $('#message-container3').text('We are still working on this and plan to release it soon. Stay tuned. Gracias 🙏').show();
});


// Submit button click event
$('.gpu-submit').click(function () {
    const container = $(this).closest('.gpu-container');
    sliderValue = container.find('.price-display').attr('data-price');
    gpuType = $(this).attr('data-gpu');

    // console.log(sliderValue, gpuType);

    $('#options, #gpu_options, #gpu_prices_limit').hide();

    showLoading();

    fetchGpuRates(gpuType, sliderValue, current_page);

    $.ajax({
        url: `https://us-central1-demokratik-ai.cloudfunctions.net/get_gpu_rates_v2?gpu_type=${gpuType}&cost_limit=${sliderValue}`, // API endpoint
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // console.log(data);

            //$('#select_cloud, #select_gpu_details').show();

            cloudGpuTypes = data.cloud_gpu_types;
            const keys = Object.keys(cloudGpuTypes);
            // console.log(keys);
            // Populate dropdowns
            populateDropdown('#dropdown3', keys);
            selectedCloud = $('#dropdown3').val();
            populateDropdown('#dropdown4', Object.keys(cloudGpuTypes[selectedCloud]));
            selectedGpu = $('#dropdown4').val();
            populateDropdown('#dropdown5', cloudGpuTypes[selectedCloud][selectedGpu]);


            hideLoading();
        },
        error: function (xhr, status, error) {
            console.error(error);
            hideLoading();
        }
    });
});