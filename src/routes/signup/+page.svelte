<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
</script>

<div class="flex items-center justify-center"><Card class="w-max">
  <CardHeader>
    <CardTitle>Create an account</CardTitle>
    <CardDescription>Sign up to start using our Pomodoro timer</CardDescription>
  </CardHeader>
  <CardContent>
    <form action="?/signup" method="post" class="space-y-4">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="Enter your email" required />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Create a password" required />
      </div>
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" name="name" type="text" placeholder="Enter your name" required />
      </div>
      <Button type="submit" class="w-full">Sign up</Button>
    </form>
  </CardContent>
  <CardFooter class="flex justify-center">
    <p class="text-sm text-muted-foreground">Already have an account? <a href="/login" class="text-primary hover:underline">Log in</a></p>
  </CardFooter>
</Card></div>