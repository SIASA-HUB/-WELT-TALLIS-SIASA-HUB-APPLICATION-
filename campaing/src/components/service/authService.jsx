// components/auth/AuthService.js
class AuthService {
  static isAuthenticated() {
    const token = localStorage.getItem("auth_token");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";

    if (!token || !isAuth) return false;

    try {
      const tokenData = JSON.parse(token);
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  static setAuthData(token, refreshToken, userData) {
    // Store token with expiry (1 hour from now)
    const tokenData = {
      token: token,
      expiresAt: Date.now() + 3600000, // 1 hour
    };
    localStorage.setItem("auth_token", JSON.stringify(tokenData));
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  }

  static logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  static getToken() {
    const tokenData = localStorage.getItem("auth_token");
    if (!tokenData) return null;
    try {
      const { token } = JSON.parse(tokenData);
      return token;
    } catch {
      return null;
    }
  }

  static getUser() {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  static getUsername() {
    const user = this.getUser();
    return user?.username || null;
  }

  static getUserId() {
    const user = this.getUser();
    return user?.user_id || null;
  }

  static getCounty() {
    const user = this.getUser();
    return user?.county || null;
  }
}

export default AuthService;
