/**
 * CareCircle API Client
 * Typed wrapper around all backend API routes.
 * Used by the front-end to replace localStorage with real DB calls.
 */

// ─── Generic fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error ${res.status}`)
  }

  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    name: string
    email: string
    password: string
    role: string
    countryCode?: string
    phone?: string
  }) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (email: string) =>
    apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
}

// ─── User ─────────────────────────────────────────────────────────────────────

export const userApi = {
  getMe: () => apiFetch<any>('/api/users/me'),

  update: (data: Partial<{
    name: string
    phone: string
    language: string
    country: string
    currentPassword: string
    newPassword: string
  }>) => apiFetch<any>('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  delete: () => apiFetch('/api/users/me', { method: 'DELETE' }),
}

// ─── Care Recipients ─────────────────────────────────────────────────────────

export const careRecipientsApi = {
  list: () => apiFetch<any[]>('/api/care-recipients'),

  create: (data: {
    name: string
    dateOfBirth?: string
    conditions?: string[]
    notes?: string
  }) => apiFetch<any>('/api/care-recipients', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    name: string
    dateOfBirth: string
    conditions: string[]
    notes: string
  }>) => apiFetch<any>(`/api/care-recipients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/care-recipients/${id}`, { method: 'DELETE' }),
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (params?: { upcoming?: boolean; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.upcoming) q.set('upcoming', 'true')
    if (params?.page) q.set('page', String(params.page))
    return apiFetch<{ appointments: any[]; total: number }>(`/api/appointments?${q}`)
  },

  create: (data: {
    title: string
    date: string
    duration?: number
    location?: string
    doctorName?: string
    type?: string
    notes?: string
    recipientId: string
  }) => apiFetch<any>('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    title: string
    date: string
    status: string
    notes: string
  }>) => apiFetch<any>(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/appointments/${id}`, { method: 'DELETE' }),
}

// ─── Medications ──────────────────────────────────────────────────────────────

export const medicationsApi = {
  list: (active?: boolean) => {
    const q = active !== undefined ? `?active=${active}` : ''
    return apiFetch<any[]>(`/api/medications${q}`)
  },

  create: (data: {
    name: string
    dosage: string
    frequency?: string
    times?: string[]
    instructions?: string
    recipientId: string
  }) => apiFetch<any>('/api/medications', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    name: string
    dosage: string
    frequency: string
    times: string[]
    active: boolean
  }>) => apiFetch<any>(`/api/medications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/medications/${id}`, { method: 'DELETE' }),

  logTaken: (id: string, scheduledTime: string, taken: boolean) =>
    apiFetch<any>(`/api/medications/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ scheduledTime, taken }),
    }),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { completed?: boolean; priority?: string }) => {
    const q = new URLSearchParams()
    if (params?.completed !== undefined) q.set('completed', String(params.completed))
    if (params?.priority) q.set('priority', params.priority)
    return apiFetch<any[]>(`/api/tasks?${q}`)
  },

  create: (data: {
    title: string
    description?: string
    dueDate?: string
    priority?: string
    category?: string
    recipientId?: string
  }) => apiFetch<any>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    title: string
    completed: boolean
    priority: string
    dueDate: string
  }>) => apiFetch<any>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),
}

// ─── Wellness ─────────────────────────────────────────────────────────────────

export const wellnessApi = {
  get: (days = 7) => apiFetch<any>(`/api/wellness?days=${days}`),

  checkin: (data: {
    stressLevel?: number
    sleepHours?: number
    mood?: number
    physicalActivity?: boolean
    selfCareTime?: number
    notes?: string
  }) => apiFetch<any>('/api/wellness', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────

export const symptomsApi = {
  list: (params?: { recipientId?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.recipientId) q.set('recipientId', params.recipientId)
    if (params?.page) q.set('page', String(params.page))
    return apiFetch<{ logs: any[]; total: number }>(`/api/symptoms?${q}`)
  },

  create: (data: {
    symptoms: { name: string; severity: number }[]
    notes?: string
    mood?: number
    painLevel?: number
    recipientId: string
    date?: string
  }) => apiFetch<any>('/api/symptoms', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/symptoms/${id}`, { method: 'DELETE' }),
}

// ─── Community ────────────────────────────────────────────────────────────────

export const communityApi = {
  list: (params?: { category?: string; search?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    if (params?.page) q.set('page', String(params.page))
    return apiFetch<{ posts: any[]; total: number }>(`/api/community/posts?${q}`)
  },

  getPost: (id: string) => apiFetch<any>(`/api/community/posts/${id}`),

  create: (data: {
    title: string
    content: string
    category?: string
    isAnonymous?: boolean
  }) => apiFetch<any>('/api/community/posts', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch(`/api/community/posts/${id}`, { method: 'DELETE' }),

  like: (id: string) =>
    apiFetch<{ liked: boolean; likes: number }>(`/api/community/posts/${id}/like`, { method: 'POST' }),

  comment: (id: string, content: string, isAnonymous = false) =>
    apiFetch<any>(`/api/community/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isAnonymous }),
    }),
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (unreadOnly = false) =>
    apiFetch<{ notifications: any[]; unreadCount: number }>(
      `/api/notifications?unread=${unreadOnly}`
    ),

  markRead: (id: string) =>
    apiFetch(`/api/notifications/${id}`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ markAllRead: true }) }),

  delete: (id: string) => apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatApi = {
  send: (messages: { role: string; content: string }[], plan?: string) =>
    apiFetch<{ message: string; remaining: number; isFallback?: boolean; limitReached?: boolean }>(
      '/api/chat',
      { method: 'POST', body: JSON.stringify({ messages, plan }) }
    ),

  history: (limit = 20) => apiFetch<{ messages: any[] }>(`/api/chat?limit=${limit}`),
}

// ─── Export data ─────────────────────────────────────────────────────────────

export const exportApi = {
  exportJson: async () => {
    const [user, recipients, appointments, medications, tasks, wellness, symptoms] = await Promise.all([
      userApi.getMe(),
      careRecipientsApi.list(),
      appointmentsApi.list(),
      medicationsApi.list(),
      tasksApi.list(),
      wellnessApi.get(30),
      symptomsApi.list(),
    ])

    return {
      exportDate: new Date().toISOString(),
      user,
      careRecipients: recipients,
      appointments: appointments.appointments,
      medications,
      tasks,
      wellness,
      symptoms: symptoms.logs,
    }
  },
}
