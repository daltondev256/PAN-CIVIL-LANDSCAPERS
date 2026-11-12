document.addEventListener('DOMContentLoaded', async () => {
    initDynamicDate();
    initSidebarNavigation();
    await protectDashboard();
});

function initDynamicDate() {
    const now = new Date();
    const year = document.getElementById('current-year');
    const date = document.getElementById('dashboard-date');
    if (year) year.textContent = now.getFullYear();
    if (date) date.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function initSidebarNavigation() {
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-menu li').forEach(node => node.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

async function protectDashboard() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!response.ok) {
            window.location.replace('login.html');
            return;
        }
        const admin = await response.json();
        const heading = document.querySelector('.content-header h2');
        if (heading) heading.textContent = `Welcome, ${admin.email}`;
        await loadDashboardData();
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.replace('login.html');
    }
}

async function loadDashboardData() {
    const tbody = document.querySelector('#submissionsTable tbody');
    if (!tbody) return;
    tbody.textContent = '';
    try {
        const [inquiriesResponse, quotesResponse] = await Promise.all([
            fetch('/api/admin/inquiries', { credentials: 'same-origin' }),
            fetch('/api/admin/quotes', { credentials: 'same-origin' })
        ]);
        if (inquiriesResponse.status === 401 || quotesResponse.status === 401) {
            window.location.replace('login.html');
            return;
        }
        if (!inquiriesResponse.ok || !quotesResponse.ok) throw new Error('Unable to load dashboard records.');
        const inquiriesData = await inquiriesResponse.json();
        const quotesData = await quotesResponse.json();

        for (const item of inquiriesData.inquiries || []) {
            const row = document.createElement('tr');
            const values = [
                new Date(item.created_at).toLocaleString(), item.name, item.email,
                item.phone || 'N/A', 'General inquiry', item.message
            ];
            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value == null ? '' : String(value);
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        }
        for (const item of quotesData.quotes || []) {
            const row = document.createElement('tr');
            [new Date(item.created_at).toLocaleString(), item.client_name, '', item.phone,
             item.service_type, `Quote request — ${item.property_type || ''} ${item.preferred_date || ''}`]
                .forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value == null ? '' : String(value);
                    row.appendChild(cell);
                });
            tbody.appendChild(row);
        }
        if (!tbody.children.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No customer inquiries or quote requests yet.';
            row.appendChild(cell);
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error(error);
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = 'Could not load records. Refresh the page to try again.';
        row.appendChild(cell);
        tbody.appendChild(row);
    }
}

async function logoutAdmin() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
        window.location.replace('login.html');
    }
}
window.logoutAdmin = logoutAdmin;
