const nodeLib = require('/lib/xp/node')
const repoLib = require('/lib/xp/repo')
const contextLib = require('/lib/xp/context')

const FEATURE_TOGGLE_REPO = 'com.gravitondigital.feature-toggle'
const FEATURE_TOGGLE_MASTER = 'master'
const FEATURE_TOGGLE_DRAFT = 'draft'

const getRepo = function() {
  return repoLib.get(FEATURE_TOGGLE_REPO)
}

const createRepo = function() {
  return repoLib.create({
    id: FEATURE_TOGGLE_REPO,
    rootPermissions: [
      {
        'principal': 'role:system.admin',
        'allow': [
          'READ',
          'CREATE',
          'MODIFY',
          'DELETE',
          'PUBLISH',
          'READ_PERMISSIONS',
          'WRITE_PERMISSIONS'
        ],
        'deny': []
      },
      {
        'principal': 'role:feature-toggle.admin',
        'allow': [
          'READ',
          'CREATE',
          'MODIFY',
          'DELETE',
          'PUBLISH',
          'READ_PERMISSIONS',
          'WRITE_PERMISSIONS'
        ],
        'deny': []
      },
      {
        'principal': 'role:feature.toggle.viewer',
        'allow': [
          'READ',
        ],
        'deny': [
          'CREATE',
          'MODIFY',
          'DELETE',
          'PUBLISH',
          'READ_PERMISSIONS',
          'WRITE_PERMISSIONS'
        ]
      },
      {
        'principal': 'role:system.everyone',
        'allow': [
          'READ',
        ],
        'deny': [
          'CREATE',
          'MODIFY',
          'DELETE',
          'PUBLISH',
          'READ_PERMISSIONS',
          'WRITE_PERMISSIONS'
        ]
      }
    ]
  })
}

const createBranch = function(branch) {
  return repoLib.createBranch({
    branchId: branch,
    repoId: FEATURE_TOGGLE_REPO
  })
}

exports.connect = function(branch) {
  const context = contextLib.get()
  let repo = getRepo()
  if(!repo) {
    repo = createRepo()
  }

  if(repo.branches.filter(b => b === FEATURE_TOGGLE_MASTER).length === 0) {
    createBranch(FEATURE_TOGGLE_MASTER)
  }
  if(repo.branches.filter(b => b === FEATURE_TOGGLE_DRAFT).length === 0) {
    createBranch(FEATURE_TOGGLE_DRAFT)
  }

  return nodeLib.connect({
    repoId: FEATURE_TOGGLE_REPO,
    branch: branch || context.branch
  })
}

exports.runAsAdmin = function(cb, branch = FEATURE_TOGGLE_DRAFT) {
  return contextLib.run({
    repository: FEATURE_TOGGLE_REPO,
    branch: branch,
    user: {
      login: 'su',
      idProvider: 'system'
    },
    principal: ['role:system.admin']
  }, cb)
}