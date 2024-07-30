<script>
    import { createEventDispatcher } from 'svelte';
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Form from "$lib/components/ui/form";
  
    const dispatch = createEventDispatcher();
    let email = '';
    let password = '';
    let isLogin = true;
  
    /**
   * @param {{ preventDefault: () => void; }} event
   */
    function handleSubmit(event) {
      event.preventDefault();
      if (isLogin) {
        dispatch('login', { email, password });
      } else {
        dispatch('signup', { email, password });
      }
    }
  
    function toggleMode() {
      isLogin = !isLogin;
    }
  </script>
  
  <Form.Root class="space-y-6" on:submit={handleSubmit}>
    <Form.Field>
      <Form.Label>Email</Form.Label>
      <Form.Input type="email" bind:value={email} required />
    </Form.Field>
    <Form.Field>
      <Form.Label>Password</Form.Label>
      <Form.Input type="password" bind:value={password} required />
    </Form.Field>
    <Button type="submit">{isLogin ? 'Login' : 'Sign Up'}</Button>
  </Form.Root>
  <p>
    {isLogin ? "Don't have an account?" : "Already have an account?"}
    <button on:click={toggleMode}>{isLogin ? 'Sign Up' : 'Login'}</button>
  </p>
  