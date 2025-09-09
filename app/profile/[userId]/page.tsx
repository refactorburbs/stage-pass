interface UserProfilePageProps {
  params: {
    userId: string;
  };
}


export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;
  // custom function for getting all user info - teams, games, etc. big hub of info.
  // Don't even need the dynamic route, really... could just skip that.
  return (
    <div>{`User number ${userId}'s profile page`}</div>
  )
}