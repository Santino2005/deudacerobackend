const PARTICIPANT_KEY = 'mi_participant_id'

export function getStoredParticipantId() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(PARTICIPANT_KEY)
}

export function saveParticipantId(id: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(PARTICIPANT_KEY, id)
}

export function clearStoredParticipantId() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('mi_participant_id')
}