import React, { useEffect, useState } from 'react';
import './ProfilePage.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="profile-page"><p>Loading...</p></div>;
  if (error) return <div className="profile-page"><p className="error">{error}</p></div>;

  return (
    <div className="profile-page glass">
      <h1 className="title">Your Profile</h1>
      <div className="stats">
        <div className="stat-card">
          <h2>Recipes Created</h2>
          <p>{profile.recipeCount ?? 0}</p>
        </div>
        <div className="stat-card">
          <h2>Average Rating</h2>
          <p>{profile.averageRating ? profile.averageRating.toFixed(2) : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
