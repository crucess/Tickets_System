export async function fetchPanels() {
    const response = await fetch('/api/panels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) {
        throw new Error('No se pudieron obtener los paneles');
    }

    return response.json();
}

export async function savePanel(panel) {
    const endpoint = panel.id ? `/api/panels/${panel.id}` : '/api/panels';
    const method = panel.id ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(panel),
    });

    if (!response.ok) {
        throw new Error('No se pudo guardar el panel');
    }

    return response.json();
}

export async function deletePanel(id) {
    const response = await fetch(`/api/panels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) {
        throw new Error('No se pudo eliminar el panel');
    }

    return response.json();
}
