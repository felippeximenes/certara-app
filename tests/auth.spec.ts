import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('landing page exibe o título Certara', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Certara/)
    await expect(page.locator('text=Certara').first()).toBeVisible()
  })

  test('acessar /app sem autenticação redireciona para /login', async ({ page }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/\/login/)
  })

  test('formulário de login exibe erro com credenciais inválidas', async ({ page }) => {
    // Mock Cognito auth endpoint to return error
    await page.route('**/cognito-idp.*amazonaws.com/**', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ __type: 'NotAuthorizedException', message: 'Incorrect username or password.' }),
      })
    })

    await page.goto('/login')
    await page.getByPlaceholder('voce@email.com').fill('invalido@teste.com')
    await page.getByPlaceholder('••••••••').fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Should show an error message
    await expect(page.locator('text=/erro|incorret|inválid/i')).toBeVisible({ timeout: 5000 })
  })

  test('tabs Entrar e Criar conta alternam o formulário', async ({ page }) => {
    await page.goto('/login')

    // Default tab is Entrar
    await expect(page.getByRole('button', { name: 'Entrar' }).first()).toBeVisible()

    // Click Criar conta tab
    await page.getByRole('button', { name: 'Criar conta' }).click()

    // Register form should appear (has Confirmar senha field)
    await expect(page.getByPlaceholder(/confirmar/i)).toBeVisible()

    // Switch back
    await page.getByRole('button', { name: 'Entrar' }).first().click()
    await expect(page.getByPlaceholder(/confirmar/i)).not.toBeVisible()
  })
})
