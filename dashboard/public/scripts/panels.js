import { fetchPanels, savePanel, deletePanel } from './api.js';

export function loadPanels() {
    fetchPanels()
        .then(panels => {
            const panelList = document.getElementById('panelList');
            panelList.innerHTML = '';

            panels.forEach(panel => {
                const div = document.createElement('div');
                div.className = 'mb-3';
                div.innerHTML = `
                    <strong>Panel ID:</strong> ${panel.id}<br>
                    <strong>Canal:</strong> ${panel.channel_id}<br>
                    <strong>Opciones:</strong> ${
                        Array.isArray(panel.options)
                            ? panel.options.map(option => `- **${option.label}**: ${option.value}`).join('<br>')
                            : 'No hay opciones disponibles.'
                    }<br>
                    <button class="btn btn-warning btn-sm" onclick="editPanel(${panel.id}, '${panel.channel_id}', '${encodeURIComponent(JSON.stringify(panel.options))}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePanel(${panel.id})">Eliminar</button>
                `;
                panelList.appendChild(div);
            });
        })
        .catch(err => console.error('Error al cargar los paneles:', err));
}

export function editPanel(id, channel_id, options) {
    const formTitle = document.getElementById('formTitle');
    formTitle.textContent = 'Editar Panel';
    document.getElementById('channel_id').value = channel_id;

    try {
        const parsedOptions = JSON.parse(decodeURIComponent(options));
        loadOptions(parsedOptions);
    } catch (e) {
        console.error('Error al cargar las opciones:', e);
        loadOptions([]);
    }

    document.getElementById('panelForm').style.display = 'block';
}
