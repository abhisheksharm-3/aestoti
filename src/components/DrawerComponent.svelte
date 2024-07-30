<script lang="ts">
  import { onMount } from 'svelte';
  import {
    RiBarChart2Line,
    RiKeyboardBoxFill,
    RiSettings3Fill,
  } from "svelte-remixicon";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Tabs from "$lib/components/ui/tabs";
  import ComingSoon from "./ComingSoon.svelte";
  import Prefrences from "./Prefrences.svelte";
  import Shortcuts from "./Shortcuts.svelte";
  import PomodoroStats from "./PomodoroStats.svelte";
  import AuthForm from "./AuthComponent.svelte";
  import NoSessionsMessage from "./NoSessionsMessage.svelte";
  import { login, logout, getSessionData, checkLoggedInUser, type Session } from '$lib/appwrite';
  import type { Models } from 'appwrite';

  let isLoggedIn = false;
  let userId: string | null = null;
  let sessions: Session[] = [];
  let activeTab: string = "stats";

  onMount(async () => {
    const loggedInUser = await checkLoggedInUser();
    if (loggedInUser) {
      isLoggedIn = true;
      userId = loggedInUser.$id; // Use $id instead of id
      await fetchSessions();
    }
  });

  async function handleLogin(event: CustomEvent<{ email: string, password: string }>) {
    const { email, password } = event.detail;
    try {
      userId = await login(email, password);
      isLoggedIn = true;
      await fetchSessions();
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (e.g., show error message)
    }
  }

  async function handleLogout() {
    try {
      await logout();
      isLoggedIn = false;
      userId = null;
      sessions = [];
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error
    }
  }

  async function fetchSessions() {
    if (userId) {
      sessions = await getSessionData(userId);
    }
  }
</script>

<Drawer.Content>
  <Drawer.Header>
    <Drawer.Title>Control Center</Drawer.Title>
    <Drawer.Description>Manage Your Pomodoro</Drawer.Description>
  </Drawer.Header>
  
  {#if isLoggedIn}
    <Tabs.Root bind:value={activeTab} class="flex items-center justify-center flex-col gap-10">
      <Tabs.List class="w-max flex gap-6">
        <Tabs.Trigger class="flex items-center gap-2" value="stats">
          <RiBarChart2Line /> Statistics
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="prefrences">
          <RiSettings3Fill /> Preferences
        </Tabs.Trigger>
        <Tabs.Trigger class="flex items-center gap-2" value="shortcuts">
          <RiKeyboardBoxFill /> Shortcuts
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="stats">
        {#if sessions.length > 0}
          <PomodoroStats {sessions} />
        {:else}
          <NoSessionsMessage />
        {/if}
      </Tabs.Content>
      <Tabs.Content value="prefrences">
        <Prefrences />
      </Tabs.Content>
      <Tabs.Content value="shortcuts">
        <Shortcuts />
      </Tabs.Content>
    </Tabs.Root>
    <Button on:click={handleLogout}>Logout</Button>
  {:else}
    <AuthForm on:login={handleLogin} />
  {/if}
  
  <Drawer.Footer class="flex items-center justify-self-center">
    <Drawer.Close class="border w-max px-4 py-2 rounded-3xl hover:bg-gray-400/10 ease-linear duration-300">
      Close
    </Drawer.Close>
  </Drawer.Footer>
</Drawer.Content>