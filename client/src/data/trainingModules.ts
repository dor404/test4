import { Module } from '../types/training';
import { basicBranchingExample, mergingExample, advancedWorkflowExample } from './branchVisualizationData';

export const trainingModules: Module[] = [
  {
    id: 'git-basics',
    title: 'Git Basics',
    description: 'Learn the fundamental concepts and commands in Git',
    content: `
# Introduction to Git

Git is a distributed version control system that helps you track changes in your code. In this module, you'll learn the basic Git commands and workflows.

## Key Concepts

1. **Repository**: A container for your project that tracks all changes
2. **Commit**: A snapshot of your changes at a specific point in time
3. **Branch**: A separate line of development
4. **Remote**: A repository hosted on a server (like GitHub)

## Basic Commands

- \`git init\`: Initialize a new Git repository
- \`git add\`: Stage changes for commit
- \`git commit\`: Save staged changes
- \`git status\`: Check repository status
- \`git log\`: View commit history
    `,
    exercises: [
      {
        id: 'init-repo',
        question: 'Initialize a Git Repository',
        description: 'Follow the steps to create a new directory and initialize it as a Git repository.',
        hints: [
          'Make sure to use the exact directory name "my-project" for validation to pass',
          'Use the proper Git command to initialize a repository'
        ],
        solution: 'mkdir my-project && cd my-project && git init',
        validationCommand: 'test -d .git && echo "Success!" || echo "Failed!"',
        isStepByStep: true,
        steps: [
          {
            instruction: 'Create a directory named "my-project"',
            solution: 'mkdir my-project',
            validationCommand: 'test -d my-project && echo "Success!" || echo "Failed!"'
          },
          {
            instruction: 'Navigate into the "my-project" directory',
            solution: 'cd my-project',
            validationCommand: 'test "$(basename $(pwd))" = "my-project" && echo "Success!" || echo "Failed!"'
          },
          {
            instruction: 'Initialize the directory as a Git repository',
            solution: 'git init',
            validationCommand: 'test -d .git && echo "Success!" || echo "Failed!"'
          }
        ]
      },
      {
        id: 'first-commit',
        question: 'Make Your First Commit',
        description: 'Create a file, stage it, and commit it to the repository.',
        hints: [
          'Use echo "# My Project" > README.md to create a file with exactly this content',
          'Use git add README.md to stage the file',
          'Use git commit -m "Initial commit" for your commit message'
        ],
        solution: 'echo "# My Project" > README.md && git add README.md && git commit -m "Initial commit"',
        validationCommand: 'git log --oneline | grep "Initial commit" && echo "Success!" || echo "Failed!"',
        isStepByStep: true,
        steps: [
          {
            instruction: 'Create a README.md file with the exact content "# My Project"',
            solution: 'echo "# My Project" > README.md',
            validationCommand: 'test -f README.md && grep -q "# My Project" README.md && echo "Success!" || echo "Failed!"'
          },
          {
            instruction: 'Stage the README.md file',
            solution: 'git add README.md',
            validationCommand: 'git status | grep "new file:.*README.md" && echo "Success!" || echo "Failed!"'
          },
          {
            instruction: 'Commit the changes with a message "Initial commit"',
            solution: 'git commit -m "Initial commit"',
            validationCommand: 'git log --oneline | grep "Initial commit" && echo "Success!" || echo "Failed!"'
          }
        ]
      }
    ],
    difficulty: 'beginner',
    estimatedTime: '30 minutes',
    visualization: null
  },
  {
    id: 'branching-basics',
    title: 'Branching and Merging',
    description: 'Learn how to work with branches and merge code changes',
    content: `
# Branching and Merging in Git

Branches allow you to develop features, fix bugs, and experiment with new ideas in isolation. Below you'll see a visualization of a typical branching workflow, where a feature branch is created, developed, and merged back into the main branch.

## Key Concepts

1. **Branch**: An independent line of development
2. **Merge**: Combining changes from different branches
3. **Conflict**: When changes in different branches affect the same code
4. **Pull Request**: A request to merge changes from one branch to another

## Common Commands

- \`git branch\`: List, create, or delete branches
- \`git checkout\`: Switch between branches
- \`git merge\`: Merge changes from one branch into another
- \`git pull\`: Fetch and merge changes from remote
    `,
    exercises: [
      {
        id: 'create-branch',
        question: 'Create and Switch to a New Branch',
        description: 'Create a new branch called "feature" and switch to it.',
        hints: [
          'Use git branch to create a new branch',
          'Use git checkout to switch to the branch',
          'Or use git checkout -b to do both at once'
        ],
        solution: 'git checkout -b feature',
        validationCommand: 'git branch --show-current | grep "feature" && echo "Success!" || echo "Failed!"'
      }
    ],
    prerequisites: ['git-basics'],
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    visualization: basicBranchingExample
  },
  {
    id: 'advanced-merging',
    title: 'Advanced Merging Strategies',
    description: 'Learn advanced merging techniques and how to resolve conflicts',
    content: `
# Advanced Merging in Git

In this module, you'll learn about different merging strategies and how to handle complex scenarios. The visualization below shows a common scenario where multiple feature branches are developed in parallel and then merged together.

## Merging Strategies

1. **Fast-forward merge**: When there are no new changes in the target branch
2. **Recursive merge**: When both branches have new changes
3. **Squash merge**: Combining all changes into a single commit
4. **Rebase**: Replaying commits on top of another branch

## Handling Merge Conflicts

1. Identify conflicting files
2. Choose which changes to keep
3. Mark conflicts as resolved
4. Complete the merge

## Common Commands

- \`git merge --no-ff\`: Create a merge commit even for fast-forward merges
- \`git merge --squash\`: Combine all changes into a single commit
- \`git rebase\`: Reapply commits on top of another branch
- \`git mergetool\`: Use a visual tool to resolve conflicts
    `,
    exercises: [
      {
        id: 'resolve-conflict',
        question: 'Resolve a Merge Conflict',
        description: 'Resolve the conflict in the README.md file and complete the merge.',
        hints: [
          'Open the conflicting file',
          'Look for conflict markers (<<<<<<, =======, >>>>>>>)',
          'Choose which changes to keep',
          'Remove conflict markers',
          'Stage and commit the resolved file'
        ],
        solution: 'git add README.md && git commit -m "Resolve merge conflict"',
        validationCommand: 'git status | grep "nothing to commit" && echo "Success!" || echo "Failed!"'
      }
    ],
    prerequisites: ['branching-basics'],
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    visualization: mergingExample
  },
  {
    id: 'git-flow',
    title: 'Git Flow & Advanced Workflows',
    description: 'Learn advanced Git workflows and the Git Flow branching model',
    content: `
# Git Flow and Advanced Workflows

Git Flow is a branching model that provides a robust framework for managing larger projects. The visualization below demonstrates a complete Git Flow workflow with feature branches, releases, and hotfixes.

## Git Flow Branch Types

1. **main**: Production-ready code
2. **develop**: Main development branch
3. **feature/\***: New features
4. **release/\***: Release preparation
5. **hotfix/\***: Production bug fixes

## Common Workflows

### Feature Development
1. Create feature branch from develop
2. Develop and test the feature
3. Merge back to develop

### Release Process
1. Create release branch from develop
2. Stabilize and test
3. Merge to main and develop
4. Tag the release

### Hotfix Process
1. Create hotfix branch from main
2. Fix the issue
3. Merge to main and develop
4. Tag the patch release

## Best Practices

- Keep feature branches focused and short-lived
- Regularly sync with develop branch
- Use meaningful branch names and commit messages
- Delete branches after merging
- Always tag releases
    `,
    exercises: [
      {
        id: 'create-feature',
        question: 'Create a Feature Branch',
        description: 'Create a new feature branch from develop and make your first commit.',
        hints: [
          'Check out the develop branch first',
          'Create a new branch with a descriptive name',
          'Make changes and commit them'
        ],
        solution: 'git checkout develop && git checkout -b feature/user-profile && git commit -m "Start user profile feature"',
        validationCommand: 'git branch --show-current | grep "feature/" && echo "Success!" || echo "Failed!"'
      },
      {
        id: 'prepare-release',
        question: 'Prepare a Release',
        description: 'Create a release branch and update the version number.',
        hints: [
          'Create a release branch with version number',
          'Update version in package.json',
          'Commit the changes'
        ],
        solution: 'git checkout -b release/1.0.0 && echo \'{"version": "1.0.0"}\' > package.json && git add package.json && git commit -m "Bump version to 1.0.0"',
        validationCommand: 'git branch --show-current | grep "release/" && echo "Success!" || echo "Failed!"'
      }
    ],
    prerequisites: ['branching-basics', 'advanced-merging'],
    difficulty: 'advanced',
    estimatedTime: '90 minutes',
    visualization: advancedWorkflowExample
  }
]; 