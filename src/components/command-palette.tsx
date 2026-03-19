'use client'

import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import {
  Home, Bot, HeartPulse, Users, BookOpen, Brain, Settings,
  Search, Calendar, Pill, FileText, Bell, Plus, LogOut,
  CreditCard, HelpCircle, Moon, Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (view: string) => void
  onAction: (action: string) => void
}

export function CommandPalette({ open, onOpenChange, onNavigate, onAction }: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  // Global Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const handleSelect = useCallback((callback: () => void) => {
    callback()
    onOpenChange(false)
    setSearch('')
  }, [onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Command Dialog */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
        <Command className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Rechercher ou taper une commande..."
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-slate-100 text-slate-500 rounded">ESC</kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              Aucun résultat trouvé
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="mb-2">
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('dashboard'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <Home className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Tableau de bord</span>
                <kbd className="text-xs text-slate-400">G D</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('assistant'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <Bot className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Assistant Cleo</span>
                <kbd className="text-xs text-slate-400">G A</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('care'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Soins</span>
                <kbd className="text-xs text-slate-400">G S</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('community'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Communauté</span>
                <kbd className="text-xs text-slate-400">G C</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('resources'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Ressources</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('wellness'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <Brain className="w-4 h-4 text-teal-600" />
                <span className="flex-1">Bien-être</span>
              </Command.Item>
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group heading="Actions rapides" className="mb-2">
              <Command.Item
                onSelect={() => handleSelect(() => onAction('new-appointment'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-teal-600" />
                </div>
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Nouveau rendez-vous</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('new-medication'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-teal-600" />
                </div>
                <Pill className="w-4 h-4 text-slate-400" />
                <span>Ajouter un médicament</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('new-post'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-teal-600" />
                </div>
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Nouvelle discussion</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('log-symptom'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-teal-600" />
                </div>
                <HeartPulse className="w-4 h-4 text-slate-400" />
                <span>Enregistrer un symptôme</span>
              </Command.Item>
            </Command.Group>

            {/* Settings */}
            <Command.Group heading="Paramètres">
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate('settings'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Paramètres du compte</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('subscription'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Gérer l'abonnement</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('help'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-50"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Centre d'aide</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction('logout'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 aria-selected:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↵</kbd>
                sélectionner
              </span>
            </div>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">⌘K</kbd>
              pour ouvrir
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
