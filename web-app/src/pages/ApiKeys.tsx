import React, { useState } from 'react'
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export default function ApiKeys() {
  const [showSecret, setShowSecret] = useState<Record<number, boolean>>({})
  const [showModal, setShowModal] = useState(false)

  const mockKeys = [
    {
      id: 1,
      name: 'Production',
      key: 'ps_live_1a2b3c4d5e6f7g8h9i0j',
      created: '2026-01-15',
      lastUsed: '5 minutes ago',
    },
    {
      id: 2,
      name: 'Development',
      key: 'ps_test_9z8y7x6w5v4u3t2s1r0q',
      created: '2026-02-20',
      lastUsed: '2 days ago',
    },
  ]

  const toggleSecret = (id: number) => {
    setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-gray-400">Manage your API keys and access tokens</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Key
        </button>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockKeys.map((key) => (
              <tr key={key.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-3 font-medium">{key.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                      {showSecret[key.id] ? key.key : '•'.repeat(20)}
                    </code>
                    <button
                      onClick={() => toggleSecret(key.id)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      {showSecret[key.id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Copy size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{key.created}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{key.lastUsed}</td>
                <td className="px-4 py-3">
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Documentation */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold mb-4">API Documentation</h3>
        <div className="bg-gray-700 rounded p-4">
          <pre className="text-sm overflow-x-auto">
{`curl -X POST https://api.promptshield.io/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "User input here",
    "threshold": 60
  }'`}
          </pre>
        </div>
      </div>
    </div>
  )
}
